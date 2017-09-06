#!/bin/bash

set -e

pusd ../

npm run prod-mode
npm run deploy -- --network $NETWORK

node ./ci-cd/set-contract-address.js $NETWORK

popd
