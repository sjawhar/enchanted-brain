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

S3_BUCKET="thecybermonk-cloudformation-artifacts"
OUTPUT_TEMPLATE="cloudformation-generated.yml"

for PACKAGE_DIR in $(find concert/app/src \
  -type d -name lib -prune \
  -o -type f -name Pipfile \
  -exec dirname {} \;
)
do
  pushd "${PACKAGE_DIR}"
  PACKAGE_NAME="$(basename "${PACKAGE_DIR}")"

  rm -rf vendor
  mkdir vendor

  pipenv lock -r > requirements.txt
  pip install --target vendor -r requirements.txt
  rm requirements.txt

  mv Pipfile "../Pipfile.${PACKAGE_NAME}.bak"
  mv Pipfile.lock "../Pipfile.${PACKAGE_NAME}.lock.bak"

  popd
done

echo "Packaging..."
aws cloudformation package \
  --template-file cloudformation.yml \
  --output-template-file $OUTPUT_TEMPLATE \
  --s3-bucket $S3_BUCKET \
  --s3-prefix "${ENVIRONMENT}/enchanted-brain" \
  $REGION_FLAG

for PACKAGE_FILE in $(find concert/app/src \
  -type d -name vendor -prune \
  -o -type f -name 'Pipfile.*.lock.bak' \
  -print
)
do
  pushd "$(dirname "${PACKAGE_FILE}")"
  PACKAGE_NAME="$(basename "${PACKAGE_FILE}" | awk -F '.' '{ print $2; }')"

  mv "Pipfile.${PACKAGE_NAME}.bak" "./${PACKAGE_NAME}/Pipfile"
  mv "Pipfile.${PACKAGE_NAME}.lock.bak" "./${PACKAGE_NAME}/Pipfile.lock"
  popd
done

echo "Deploying..."
aws cloudformation deploy \
  --template-file $OUTPUT_TEMPLATE \
  --stack-name "${ENVIRONMENT}-enchanted-brain" \
  $REGION_FLAG \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --tags "threatspan-environment=${ENVIRONMENT}" \
    "threatspan-system=enchanted-brain" \
  --parameter-overrides "Environment=${ENVIRONMENT}" \
  "${@:3}"

rm -f $OUTPUT_TEMPLATE
