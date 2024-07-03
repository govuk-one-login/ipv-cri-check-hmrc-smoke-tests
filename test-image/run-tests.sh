#!/usr/bin/env bash
set -eu

stack_name=${STACK_NAME:-smoke-tests}
lambda_name="$stack_name-CanaryRunnerFunction"

canary_names=$(
  aws cloudformation describe-stacks --stack-name "$stack_name" --output json \
    --query 'Stacks[0].Outputs[?OutputKey==`CanaryNames`]'
)

if [[ $(jq length <<< "$canary_names") -eq 0 ]]; then
  echo "  𝑥 Canary names output not found in stack $stack_name"
  exit 1
fi

IFS="," read -ra canaries < <(jq --raw-output '.[0].OutputValue' <<< "$canary_names")

canary_results_dir="canary-results"
mkdir -p "$canary_results_dir"

echo "ℹ Running ${#canaries[@]} canaries from stack $stack_name using function $lambda_name"
success=true
index=1

for canary in "${canaries[@]}"; do
  echo "» [$((index++))/${#canaries[@]}] Running canary $canary"

  output_file="$canary_results_dir/$canary.json"
  payload=$(jq --null-input --arg canaryName "$canary" '{canaryName: $canaryName}' | base64)
  canary_result=$(aws lambda invoke --function-name "$lambda_name" --payload "$payload" "$output_file")

  if [[ $(jq 'has("FunctionError")' <<< "$canary_result") == true ]]; then
    echo "  𝑥 Lambda invocation failed for canary $canary"
    jq < "$output_file"
    success=false
  elif [[ $(jq --raw-output '.passed' "$output_file") == true ]]; then
    echo "  ✔ Canary $canary passed"
  else
    echo "  𝑥 Canary $canary failed"
    success=false
  fi
done

$success || exit 1
