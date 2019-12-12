## Client
Client files are in the `client` directory. We use a Docker container running the Expo CLI for local development. This builds and streams the necessary JavaScript bundle to phones running the Expo app.

### Setup
Copy `.env.dist` to `.env` and fill in the necessary environment variables. See the Usage instructions for the relevant client version you want to run for necessary environment variables.

### Useful Commands
**Install packages**
```bash
docker-compose -f docker-compose.util.yml run --rm npm install
```
**Launch Expo packager**
```bash
REACT_NATIVE_PACKAGER_HOSTNAME=$IPADDRESS docker-compose -f docker-compose.development.yml up
```
`$IPADDRESS` should be an IP address at which your phone can reach the computer running the Expo packager. After you run this, a QR code will be output to the console. Scan this QR code from your phone to launch the app. Code changes will trigger an automatic re-bundle and deploy to your phone.

**Auto-format code**
```bash
docker-compose -f docker-compose.util.yml run --rm npm run format
```
**Run tests**
```bash
docker-compose -f docker-compose.util.yml run --rm npm run test
```

## Concert Lambda Functions
Concert backend files are in the `concert` directory. We use Docker containers running SAM and DynamoDB for local development. Unit tests stub all external communications (e.g. AWS SDK function calls).

### Setup
1. Copy `env.dist.json` to `env.local.json` and fill in all relevant environment variables for the lambda function(s) you want to test.
2. If needed, create an `event.local.json` for invoking your lambda function. You can use the `event.*.dist.json` files as guides for the events used by different services.

### Useful Commands
**Set up local DB**
```bash
docker-compose -f docker-compose.development.yml up -d db dbsetup dbadmin
```
**Install packages**
```bash
docker-compose -f docker-compose.util.yml run --rm pipenv install
```
**Invoke Lambda functions**
```bash
docker-compose -f docker-compose.development.yml run --rm invoke-lambda $EVENT_FILE $FUNCTION_NAME
```
**Auto-format code**
```bash
docker-compose -f docker-compose.util.yml run --rm pipenv run format
```
**Run tests**
```bash
docker-compose -f docker-compose.util.yml run --rm pipenv run test
```
OR 
```bash
docker-compose -f docker-compose.util.yml run --rm pipenv run test-dev
```

## Useful Bash Aliases
```bash
npm() {
    docker run --rm -it \
        --log-driver none \
        --user node \
        --volume "${HOME}/.npm:/home/node/.npm" \
        --volume "`pwd`:/app" \
        --workdir /app \
        npm:10 $@
}
pipenv() {
    docker run --rm -it \
        --log-driver none \
        --user pipenv \
        --volume "${HOME}/.local/share/virtualenvs:/home/pipenv/.local/share/virtualenvs" \
        --volume "`pwd`:/app" \
        --workdir /app \
        sjawhar/pipenv:3.7-2018.11.26 $@
}
dc() {
    docker-compose -f "docker-compose.${1}.yml" ${@:2}
}
alias dcdev='dc development'
alias dcutil='dc util'
```