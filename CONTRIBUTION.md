# Installation

`git clone -b develop --recursive git@github.com:etherisc/flightDelay.git`

`npm install`

`sudo pip install cryptography --global-option=build_ext --global-option="-L/usr/local/opt/openssl/lib" --global-option="-I/usr/local/opt/openssl/include"`

`sudo pip install base58`

## FlightStat
Replace $FLIGHT_STAT_APP_ID and $FLIGHT_STAT_APP_KEY with your FlightStat API credentials
`APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY ./preprocess.sh`

## Testrpc
`npm run testrpc`

## Bridge to Oraclize
`cd external/ethereum-bridge && npm install`

`node bridge -a 0`

Replace OAR in `contracts-templates/FlightDelayOraclizeInterface.sol` if ethereum-bridge updated (OAR should be removed for production deploy)

## Migrations
`./migselect.sh`

## Tests
`./testselect.sh`

`npm run test -- --network testrpc`

## Deploy to testrpc
`npm run deploy -- --network testrpc`

`npm run console`

## Degugging

`truffle console`

`const FDNewPolicyAt = ""`

`FlightDelayNewPolicy.at(FDNewPolicyAt).allEvents({fromBlock: 0}).watch((error, result) => { if(result.args.str_reason) { console.log(result.event, web3.toAscii(result.args.str_reason)) } else { console.log(result.event, result.args) } })`

`FlightDelayNewPolicy.at(FDNewPolicyAt).allEvents({fromBlock: 0}).get((error, result) => { console.log(result) })`

`FlightDelayNewPolicy.at(FDNewPolicyAt).newPolicy("KL/1770", "/dep/2018/01/01", 1514764800, 1514808000, {from: web3.eth.coinbase, to: FDNewPolicyAt, value: web3.toWei(0.5, 'ether'), gas: 1000000})`
