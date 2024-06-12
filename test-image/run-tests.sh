#!/usr/bin/env bash
set -eu

stack_name=${STACK_NAME:-smoke-tests}

stack_outputs=$(aws cloudformation describe-stacks --stack-name "$stack_name" --output json | jq '.Stacks[0].Outputs[]')
lambda_name=$(jq --raw-output 'select(.OutputKey == "CanaryInvokerFunctionName").OutputValue' <<< "$stack_outputs")

read -ra canaries < <(jq --raw-output 'select(.OutputKey == "CanaryNames").OutputValue' <<< "$stack_outputs")

mkdir -p canary-results
success=true

echo "ℹ Running ${#canaries[@]} canaries from stack $stack_name using function $lambda_name"

for canary in "${canaries[@]}"; do
  echo "» Executing canary $canary"

  output_file="canary-results/$canary.json"
  payload=$(jq --null-input --compact-output --arg canaryName "$canary" '{canaryName: $canaryName}' | base64)

  invocation_result=$(aws lambda invoke --function-name "$lambda_name" --payload "$payload" "$output_file")

  if [[ $(jq --raw-output '.FunctionError' <<< "$invocation_result") != null ]]; then
    echo "  𝑥 Lambda invocation failed for $canary"
    jq . "$output_file"
    success=false
  elif [[ $(jq --raw-output '.passed' "$output_file") == true ]]; then
    echo "  ✔ Canary $canary passed"
  else
    echo "  𝑥 Canary $canary failed"
    success=false
  fi
done

$success || exit 1
