#!/bin/bash
cd "$(dirname $0)"
rm -f microbots.zip
bash mkdoc.sh API.md help.html "Help"
bash mkdoc.sh LICENSE.md license.html "License"
pushd web
npm install
npm run manifest
npm run build
cd public/api/v1/web/nuvolaris/default/microbots
zip -r ../../../../../../../../microbots.zip *
cd ../../../../../..
zip ../../microbots.zip index.js package.json
popd
cp microbots.zip robots/microbots.zip
