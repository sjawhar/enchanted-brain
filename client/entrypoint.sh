#!/bin/sh
cat << EOF > .env
AMPLIFY_AUTH_DISABLE=true
AMPLIFY_AUTH_REGION=
AMPLIFY_AUTH_USER_POOL_ID=
AMPLIFY_AUTH_WEB_CLIENT_ID=
CONCERT_START_TIME=
MTURK_API_URL=${MTURK_API_URL}
MTURK_CHOICE_INTERVAL=${MTURK_CHOICE_INTERVAL}
MTURK_CHOICE_TIMEOUT=${MTURK_CHOICE_TIMEOUT}
MTURK_CHOICE_TYPE=${MTURK_CHOICE_TYPE}
MTURK_SONG_ID=${MTURK_SONG_ID}
WEBSOCKET_API_STUB=
WEBSOCKET_API_URL=
EOF

exec npm start
