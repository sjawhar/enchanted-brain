#!/bin/bash
set -euf -o pipefail

MTURK_API_URL="${MTURK_API_URL:-}"
MTURK_APP_SECRET="${MTURK_APP_SECRET:-}"
MTURK_VALID_CHOICE_TYPES="${MTURK_VALID_CHOICE_TYPES:-}"
MTURK_VALID_SONG_IDS="${MTURK_VALID_SONG_IDS:-}"
S3_BUCKET_URL="${S3_BUCKET_URL:-}"

if [ -z "${MTURK_API_URL}" ] || [ -z "${MTURK_APP_SECRET}" ] || [ -z "${MTURK_VALID_CHOICE_TYPES}" ] || [ -z "${MTURK_VALID_SONG_IDS}" ] || [ -z "${S3_BUCKET_URL}" ]
then
    echo 'Please specify the following variables: MTURK_API_URL, MTURK_APP_SECRET, MTURK_VALID_CHOICE_TYPES, MTURK_VALID_SONG_IDS, S3_BUCKET_URL'
    exit 1
fi

echo "Starting bundler..."
docker-compose -f docker-compose.development.yml up -d --force
cat << EOF
Please press enter after the bundler is running. To check, run the below command in another terminal

    docker logs --follow enchanted-brain

EOF
read -p "Press enter when ready..." val

urlsFile="app/dist/qr-code-urls.txt"

for MTURK_CHOICE_TYPE in ${MTURK_VALID_CHOICE_TYPES//,/ }
do
    for MTURK_SONG_ID in ${MTURK_VALID_SONG_IDS//,/ }
    do
        cat << EOF > app/.env
AMPLIFY_AUTH_DISABLE=true
AMPLIFY_AUTH_REGION=
AMPLIFY_AUTH_USER_POOL_ID=
AMPLIFY_AUTH_WEB_CLIENT_ID=
CONCERT_START_TIME=
MTURK_API_URL=${MTURK_API_URL}
MTURK_API_STUB=${MTURK_API_STUB:-false}
MTURK_APP_SECRET=${MTURK_APP_SECRET}
MTURK_CHOICE_INTERVAL=${MTURK_CHOICE_INTERVAL:-20}
MTURK_CHOICE_TIMEOUT=${MTURK_CHOICE_TIMEOUT:-5}
MTURK_CHOICE_TYPE=${MTURK_CHOICE_TYPE}
MTURK_SONG_ID=${MTURK_SONG_ID}
WEBSOCKET_API_STUB=true
WEBSOCKET_API_URL=
EOF

        subFolder="${MTURK_SONG_ID}/${MTURK_CHOICE_TYPE}"
        publicUrl="${S3_BUCKET_URL}/Builds/${subFolder}"
        distFolder="dist/${subFolder}"

        rm -rf "app/${distFolder}"
        echo "Clearing cache. Press Ctrl+C when prompted..."
        docker exec -it enchanted-brain npm start -- --clear | grep -o 'Press Ctrl+C'
        docker exec enchanted-brain npm run export -- --public-url "https://${publicUrl}" --output-dir "${distFolder}"

        echo "${MTURK_SONG_ID} | ${MTURK_CHOICE_TYPE} | Android - exps://${publicUrl}/android-index.json" >> "${urlsFile}"
        echo "${MTURK_SONG_ID} | ${MTURK_CHOICE_TYPE} | iOS - exps://${publicUrl}/ios-index.json" >> "${urlsFile}"
    done
done

cat "${urlsFile}"
rm "${urlsFile}"
echo "Done!"
