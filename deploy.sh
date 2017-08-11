#!/bin/bash

echo "Deploying to" $1

echo "Installing Parity"
bash <(curl https://get.parity.io -Lk)

echo "Installing NPM packages"
npm install

echo "Preprocessing"
APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY ./preprocess.sh $1

echo "Getting author"
author=$(node -e "console.log(require('./truffle.js').networks['$1'].from)")
echo "Author:" $author

echo "Decrypting keys"
openssl aes-256-cbc -K $encrypted_d265c45176be_key -iv $encrypted_d265c45176be_iv -in keys.tar.enc -out keys.tar -d

echo "Extracting keys"
tar xvf keys.tar

echo "Running Parity"
ls -la ./keys
echo "parity --author $author --chain $1 --unlock $author --password ./keys/$1.txt --keys-path ./keys/ --mode active"
parity --author $author --chain $1 --unlock $author --password ./keys/$1.txt --keys-path ./keys/ --mode active &
sleep 5

echo "Synchronising with network"
until curl --data '{"jsonrpc":"2.0","method":"eth_syncing", "id":1}' -H "Content-Type: application/json" -s localhost:8545 | grep 'false'
do
  curl --data '{"jsonrpc":"2.0","method":"eth_syncing", "id":1}' -H "Content-Type: application/json" localhost:8545
  sleep 3
done

echo "Selecting migrations"
./migselect.sh

echo "Selecting tests"
./testselect.sh

echo "Running tests"
npm test -- --network $1

echo "Deploying"
npm run deploy -- --network $1
