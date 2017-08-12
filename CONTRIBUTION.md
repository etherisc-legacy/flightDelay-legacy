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

`node bridge -a 0 -H localhost:9545`

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

## Changing addresses of accounts in networks

Addresses are specified in `truffle.js` and used in `deploy.sh`. 

For deploy process it's necessary to provide Keystore File JSON file and password file to this key in Parity arguments.

Generating new account:

`parity account new --chain kovan`

`parity account new --chain ropsten`

`parity account new --chain mainnet`

Since it's sensitive information you have to encrypt this:

`tar cvf keys.tar keys`

`travis encrypt-file keys.tar`

In deploy script `keys.tar.enc` can be decoded:

`openssl aes-256-cbc -K $encrypted_d265c45176be_key -iv $encrypted_d265c45176be_iv -in keys.tar.enc -out keys.tar -d`

## Changing FlightStat API keys

Remove existing variables from `travis.yml` in `env.matrix` section.

Then add new variables:

`travis encrypt FLIGHT_STAT_APP_ID=REAL_ID --add`

`travis encrypt FLIGHT_STAT_APP_KEY=REAL_KEY --add`
