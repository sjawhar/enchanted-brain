#!/bin/bash
set -euf -o pipefail

failure=0

for file in $(find . \
  -type d -name node_modules -prune \
  -o -type d -name layers -prune \
  -o -type f -name '*-generated.yml' -prune \
  -o -type f -name '*.yml' \
  -exec grep -il AWSTemplateFormatVersion {} \;
)
do
  echo "Validating ${file}..."
  aws cloudformation validate-template --template-body "file://$file" || failure=1
  echo ""
done

exit $failure
