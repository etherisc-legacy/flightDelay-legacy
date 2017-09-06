#!/bin/bash

set -e

pushd ../

echo "Deploying to" $1

echo "Installing dependencies"
pip install --upgrade --force-reinstall cffi cryptography base58

echo "Installing Parity"
bash <(curl https://get.parity.io -Lk)

echo "Installing NPM packages"
npm install

echo "Getting authors"
author=$(node -e "console.log(require('./truffle.js').networks['$1'].from)")
author2=$(node -e "console.log(require('./truffle.js').networks['$1'].from2)")
echo "Author:" $author, $author2

echo "Decrypting keys"
openssl aes-256-cbc -K $encrypted_d265c45176be_key -iv $encrypted_d265c45176be_iv -in ./ci-cd/keys.tar.enc -out keys.tar -d

echo "Extracting keys"
tar xvf keys.tar

echo "Running Parity"
ls -la ./keys
echo "parity --author $author --chain $1 --unlock $author,$author2 --password ./keys/$1.txt --keys-path ./keys/ --mode active --geth"
parity --author $author --chain $1 --unlock $author,$author2 --password ./keys/$1.txt --keys-path ./keys/ --mode active --geth &
sleep 5

echo "Synchronising with network"
until curl --data '{"jsonrpc":"2.0","method":"eth_syncing", "id":1}' -H "Content-Type: application/json" -s localhost:8545 | grep 'false'
do
    curl --data '{"jsonrpc":"2.0","method":"eth_syncing", "id":1}' -H "Content-Type: application/json" -s localhost:8545
    sleep 3
done

echo "Preprocess contracts"
APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run prod-mode

echo "Compiling"
npm run compile

ln -s ./migrations-available/302_deploy_Other.js ./migrations/302_deploy_Other.js

ln -s ./test-available/Test_Deploy.js ./migrations/Test_Deploy.js
ln -s ./test-available/Test_Destruct.js ./migrations/Test_Destruct.js
ln -s ./test-available/Test_FlightDelayNewPolicy.js ./migrations/Test_FlightDelayNewPolicy.js

npm test -- --network $1

echo "Deploying"
npm run deploy -- --network $1

node ./ci-cd/set-contract-address.js $1

popd
