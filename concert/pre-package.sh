#!/bin/bash
set -euf -o pipefail

pipInstall() {
  mkdir -p $1
  pipenv lock -r > requirements.txt
  pip install --target $1 -r requirements.txt
  rm requirements.txt
}

for PACKAGE_DIR in $(find app/src/functions \
  -type d -name lib -prune \
  -o -type d -name vendor -prune \
  -o -type f -name Pipfile \
  -exec dirname {} \;
)
do
  pushd "${PACKAGE_DIR}"
  PACKAGE_NAME="$(basename "${PACKAGE_DIR}")"

  rm -rf vendor
  pipInstall vendor

  mv Pipfile "../Pipfile.${PACKAGE_NAME}.bak"
  mv Pipfile.lock "../Pipfile.${PACKAGE_NAME}.lock.bak"

  popd
done

pushd app/src/layer
if [ -f Pipfile ]
then
  rm -rf python/lib
  pipInstall python/lib/python3.7/site-packages

  mv Pipfile "../Pipfile.layer.bak"
  mv Pipfile.lock "../Pipfile.layer.lock.bak"
fi
popd
