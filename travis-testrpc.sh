#!/bin/bash

APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY ./preprocess.sh testrpc
npm run testrpc &
cd external/ethereum-bridge && npm install && node bridge -a 0 -H localhost:9545 &

echo "Wait bridge"
until cat ./external/ethereum-bridsge/bridge.log | grep "Listening @"
do
  echo -n .
  sleep 1
done

./migselect.sh
npm run compile-testrpc
./test-get.sh Test_FlightDelayController.js
npm test -- --network testrpc
./test-get.sh Test_FlightDelayDestruct.js
npm test -- --network testrpc
./test-get.sh Test_FlightDelayNewPolicy.js
npm test -- --network testrpc
sudo killall node
