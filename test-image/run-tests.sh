#!/usr/bin/env bash
set -eu

stack_name=${STACK_NAME:-smoke-tests}
lambda_name="$stack_name-CanaryRunnerFunction"

echo "ℹ Running canaries from stack $stack_name using function $lambda_name"

output_file="canary-results.json"
invocation_result=$(aws lambda invoke --cli-read-timeout 240 --function-name "$lambda_name" "$output_file")

if [[ $(jq --raw-output '.FunctionError' <<< "$invocation_result") != null ]]; then
  echo "𝑥 Canary runner Lambda invocation failed"
  jq . "$output_file"
  exit 1
fi

if [[ $(jq --raw-output '.success' "$output_file") != true ]]; then
  echo "𝑥 Canaries failed"
  exit 1
fi

echo "✔ Canaries passed"
