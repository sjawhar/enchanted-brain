#!/bin/bash
set -euf -o pipefail

for PACKAGE_FILE in $(find app/src \
  -type d -name lib -prune \
  -o -type d -name vendor -prune \
  -o -type f -name 'Pipfile.*.lock.bak' \
  -print
)
do
  pushd "$(dirname "${PACKAGE_FILE}")"
  PACKAGE_NAME="$(basename "${PACKAGE_FILE}" | awk -F '.' '{ print $2; }')"

  mv "Pipfile.${PACKAGE_NAME}.bak" "./${PACKAGE_NAME}/Pipfile"
  mv "Pipfile.${PACKAGE_NAME}.lock.bak" "./${PACKAGE_NAME}/Pipfile.lock"
  rm -rf "./${PACKAGE_NAME}/vendor" "./${PACKAGE_NAME}/python/lib"
  popd
done
