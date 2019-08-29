#!/bin/bash
set -euf -o pipefail

promptValue() {
  read -p "$1"": " val
  echo $val
}

ENVIRONMENT="${1-$(promptValue Environment)}"
REGION_FLAG="${2-$(promptValue 'Region (leave blank for profile default)')}"

if [ -n "${REGION_FLAG}" ]
then
  REGION_FLAG="--region ${REGION_FLAG}"
fi

S3_BUCKET="thecybermonk-${ENVIRONMENT}-cloudformation-artifacts"
OUTPUT_TEMPLATE="cloudformation-generated.yml"

pushd concert
./pre-package.sh
popd

echo "Packaging..."
aws cloudformation package \
  --template-file cloudformation.yml \
  --output-template-file $OUTPUT_TEMPLATE \
  --s3-bucket "${S3_BUCKET}" \
  --s3-prefix enchanted-brain \
  $REGION_FLAG

pushd concert
./post-package.sh
popd

echo "Deploying..."
aws cloudformation deploy \
  --template-file $OUTPUT_TEMPLATE \
  --stack-name "${ENVIRONMENT}-enchanted-brain" \
  $REGION_FLAG \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --tags "environment=${ENVIRONMENT}" \
    "system=enchanted-brain" \
  --no-fail-on-empty-changeset \
  --parameter-overrides "Environment=${ENVIRONMENT}" \
  "${@:3}"

rm -f $OUTPUT_TEMPLATE
