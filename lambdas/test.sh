#!/bin/bash
set -euf -o pipefail

failure=0
test_script="${1:-test}"

for FUNCTION_NAME in $(find . -type f -name Pipfile | awk -F '/' '{print $2;}' | sort)
do
  echo "Testing $FUNCTION_NAME"
  export FUNCTION_NAME
  docker-compose -f docker-compose.util.yml run --rm pipenv install --dev
  docker-compose -f docker-compose.util.yml run --rm pipenv run $test_script || failure=1
done

exit $failure
