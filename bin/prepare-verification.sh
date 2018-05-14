#!/bin/sh

./node_modules/.bin/truffle-flattener ./contracts/FlightDelayAccessController.sol > ./verification/FlightDelayAccessController.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayAddressResolver.sol > ./verification/FlightDelayAddressResolver.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayController.sol > ./verification/FlightDelayController.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayDatabase.sol > ./verification/FlightDelayDatabase.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayLedger.sol > ./verification/FlightDelayLedger.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayNewPolicy.sol > ./verification/FlightDelayNewPolicy.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayPayout.sol > ./verification/FlightDelayPayout.txt
./node_modules/.bin/truffle-flattener ./contracts/FlightDelayUnderwrite.sol > ./verification/FlightDelayUnderwrite.txt
