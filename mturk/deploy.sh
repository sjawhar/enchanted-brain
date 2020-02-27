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

S3_BUCKET="neurotech-foundation-${ENVIRONMENT}-cloudformation-artifacts"
OUTPUT_TEMPLATE="cloudformation-generated.yml"

echo "Packaging..."
aws cloudformation package \
  --template-file cloudformation.yml \
  --output-template-file $OUTPUT_TEMPLATE \
  --s3-bucket "${S3_BUCKET}" \
  --s3-prefix enchanted-brain-mturk \
  $REGION_FLAG

echo "Deploying..."
aws cloudformation deploy \
  --template-file $OUTPUT_TEMPLATE \
  --stack-name "${ENVIRONMENT}-enchanted-brain-mturk" \
  $REGION_FLAG \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --tags "environment=${ENVIRONMENT}" \
    "system=enchanted-brain-mturk" \
  --no-fail-on-empty-changeset \
  --parameter-overrides "Environment=${ENVIRONMENT}" \
  "${@:3}"

rm -f $OUTPUT_TEMPLATE
