#!/bin/bash
set -euf -o pipefail

SIDEBAR_FILE="__Sidebar.md"
GENERATE_MATCH="{{SIDEBAR_GENERATE}}"

for SIDEBAR_PATH in $(find . \
  -type f -name "${SIDEBAR_FILE}" \
  -exec grep -l "${GENERATE_MATCH}" {} \;
)
do
  SIDEBAR_DIR="$(dirname ${SIDEBAR_PATH})"
  pushd "${SIDEBAR_DIR}"

  MARKDOWN_FILE="`basename ${SIDEBAR_DIR}`.md"
  grep -oP '(?<=^#)#+ .*$' "${MARKDOWN_FILE}" | awk '{
    original_len = length($0)
    sub(/^#+ /,"")
    indent = sprintf("%"(original_len - length($0) - 1)"s","")
    gsub(" ", "\\&nbsp;\\&nbsp;", indent)
    gsub(" ", "", indent)
    link = tolower($0)
    gsub(/[^a-zA-Z0-9 _-]/, "", link)
    gsub(" ", "-", link)
    entry = indent "["$0"](#"link")  "
    print entry
  }' > replace.txt

  sed -i 's/'"${GENERATE_MATCH}"'/cat replace.txt/e' "${SIDEBAR_FILE}"
  rm replace.txt

  popd
done
