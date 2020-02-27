#!/bin/bash
set -euf -o pipefail
batchFile='batch.csv'

for manifestUrl in $(grep -oP 'exps://.+?-index.json' $batchFile)
do
    imageData="data:image/png;base64,$(curl 'https://qrcode.tec-it.com/API/QRCode' \
        -H 'Content-Type: application/json' \
        --data '{
            "data": {
                "url": "'${manifestUrl}'",
                "datatype": "Url"
            },
            "settings": {
                "errorcorrection": "L",
                "codepage":"Utf8",
                "quietzone":0,
                "quietunit":"Mm",
                "dpi":300,
                "size":"Medium",
                "color":"#000000",
                "istransparent":"false",
                "backcolor":"#ffffff"
            },
            "output":{ "method":"Base64" }
        }'
    )"
    sed -i "s|${manifestUrl}|${imageData}|" $batchFile
done
