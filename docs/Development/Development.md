## Overview
We use Docker containers running SAM and DynamoDB for local development. Unit tests stub all external communications (e.g. AWS SDK function calls).

## Setting Up
1. Copy `env.dist.json` to `env.local.json` and fill in all relevant environment variables for the lambda function(s) you want to test.
2. If needed, create an `event.local.json` for invoking your lambda function. You can use `event.dist.json` as a guide.

## Useful Commands
### Setting up local DB
```
docker-compose -f docker-compose.development.yml up -d db setup-db
```

### Installing packages
```
FUNCTION_NAME=$FUNCTION_NAME docker-compose -f docker-compose.util.yml run --rm install [OPTIONS]
```

### Running tests
```
FUNCTION_NAME=$FUNCTION_NAME docker-compose -f docker-compose.util.yml run --rm test [OPTIONS]
```

### Invoking non-API Lambda functions
* `docker-compose -f docker-compose.development.yml run --rm invoke-lambda --event $EVENT_FILE $FUNCTION_NAME`

## Tips
* `export FUNCTION_NAME` is your friend
* Useful bash aliases:
    ```bash
    dc() {
        docker-compose -f "docker-compose.${1}.yml" ${@:2}
    }
    alias dcdev='dc development'
    ```