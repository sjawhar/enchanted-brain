#!/bin/bash
set -euf -o pipefail

docker-compose -f docker-compose.test.yml up --build \
  --abort-on-container-exit --exit-code-from sut
