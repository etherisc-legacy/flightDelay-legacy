# Installation

`npm install`

## FlightStat
Replace $FLIGHT_STAT_APP_ID and $FLIGHT_STAT_APP_KEY with your FlightStat API credentials
`APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY ./preprocess.sh`

## Testrpc
`npm run testrpc`

## Bridge to Oraclize
`cd external/ethereum-bridge && npm install`

`node bridge -a 0`

## Migrations
`./migselect.sh`

## Tests
`./testselect.sh`

`npm run test`

## Deploy to testrpc
`npm run deploy-testrpc`

`npm run console`
