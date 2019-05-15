## Overview
We use Docker containers running SAM and DynamoDB for local development. Unit tests stub all external communications (e.g. AWS SDK function calls).

## Setting Up
1. Copy `env.dist.json` to `env.local.json` and fill in all relevant environment variables for the lambda function(s) you want to test.
2. If needed, create an `event.local.json` for invoking your lambda function. You can use `event.dist.json` as a guide.

## Useful Commands
### Setting up local DB
```bash
docker-compose -f docker-compose.development.yml up -d db setup-db
```

### Installing packages
```bash
FUNCTION_NAME=$FUNCTION_NAME docker-compose -f docker-compose.util.yml run --rm pipenv install [OPTIONS]
```

### Running tests
```bash
FUNCTION_NAME=$FUNCTION_NAME docker-compose -f docker-compose.util.yml run --rm pipenv run pytest [OPTIONS]
```

### Invoking Lambda functions
```bash
docker-compose -f docker-compose.development.yml run --rm invoke-lambda $EVENT_FILE $FUNCTION_NAME
```
**NOTE**: `$EVENT_FILE` should be specified from the repo root (e.g. `lambdas/event.local.json`).

## Tips
* `export FUNCTION_NAME` is your friend
* Useful bash aliases:
    ```bash
    pipenv() {
        docker run --rm -it --log-driver none --user pipenv \
            -v "`dwd`:/app" --workdir /app \
            -v "$HOME/.npm:/home/node/.npm" \
            -v "$HOME/.local/share/virtualenvs:/home/pipenv/.local/share/virtualenvs" \
            sjawhar/pipenv:3.7-2018.11.26 $@
    }
    dc() {
        docker-compose -f "docker-compose.${1}.yml" ${@:2}
    }
    alias dcdev='dc development'
    alias dcutil='dc util'
    ```