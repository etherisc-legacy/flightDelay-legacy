#!/bin/bash

set -e

./preprocess.sh $NETWORK

npm run deploy -- --network $NETWORK

node set-contract-address.js $NETWORK
