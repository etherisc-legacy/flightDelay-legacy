#!/bin/bash

set -e

APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run test-mode
npm run testrpc &
pushd ./external/ethereum-bridge
npm install
popd
npm run bridge &

echo "pwd ------------------------------------------"
pwd
ls -l ./external/ethereum-bridge

echo "Wait bridge"
until cat ./external/ethereum-bridge/bridge.log | grep "Listening @"
do
    echo -n .
    sleep 1
done

npm run select-resources
npm run compile
npm run test

killall -9 node
