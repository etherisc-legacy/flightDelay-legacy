#!/bin/bash

set -e

ls -la $HOME/build

APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run test-mode
npm run testrpc > testrpc.log &
pushd ./external/ethereum-bridge
npm install
node bridge -a 6 -H localhost:9545 --dev &
popd

echo "Wait bridge"
until cat ./external/ethereum-bridge/bridge.log | grep "Listening @"
do
    echo -n .
    sleep 1
done

echo "Select resources"
npm run select-resources

echo "Start compiling"
npm run compile

echo "Start testing"
time npm run test

echo "Kill bridge"
killall -9 node
