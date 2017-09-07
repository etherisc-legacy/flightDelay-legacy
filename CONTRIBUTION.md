# Installation

`git clone -b develop --recursive git@github.com:etherisc/flightDelay.git`

`npm install`

`sudo pip install cryptography --global-option=build_ext --global-option="-L/usr/local/opt/openssl/lib" --global-option="-I/usr/local/opt/openssl/include"`

`sudo pip install base58`

## FlightStat

Replace $FLIGHT_STAT_APP_ID and $FLIGHT_STAT_APP_KEY with your FlightStat API credentials

`APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run test-mode`

## Testrpc

`npm run testrpc`

## Bridge to Oraclize (only for testrpc)

`npm run bridge`

## Select migrations and tests

`npm run select-resources`

## Tests

for testrpc

`npm test`

for kovan

`parity --author 0xc3878b8566f5626fb8d6ad43b647e3405668f20b --chain kovan --unlock 0xc3878b8566f5626fb8d6ad43b647e3405668f20b,0x1d45c059e511241a5c1b3081e56302a59621c94c,0x79e3c795890175180c492b66b69f0d35ff031de4,0xa3a645c963ca4c03328afbd9a79f45716b492231,0x6e5dc1285a441627c0046604586b081bbe41fbc8,0x189a99226ad233df825cc1f9d48c8afba529b803,0x5226d6ce4d0b84ec9f8214ee4f5883738dad130e,0x1885bf0a04c6948061007cb556935a903b1bed95,0xd3ce03dfcc6b95c55f991b989b48bff28a9f3962,0xc95efc83de5832510dac2c29198279eb8662d77e --password ~/Desktop/keys/kovan.txt --keys-path ~/Desktop/keys/ --mode active --geth --force-ui`

`APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run prod-mode`

`npm test -- --network kovan`

## Deploy

for testrpc

`npm run deploy`

for kovan

`parity --author 0xc3878b8566f5626fb8d6ad43b647e3405668f20b --chain kovan --unlock 0xc3878b8566f5626fb8d6ad43b647e3405668f20b,0x1d45c059e511241a5c1b3081e56302a59621c94c,0x79e3c795890175180c492b66b69f0d35ff031de4,0xa3a645c963ca4c03328afbd9a79f45716b492231,0x6e5dc1285a441627c0046604586b081bbe41fbc8,0x189a99226ad233df825cc1f9d48c8afba529b803,0x5226d6ce4d0b84ec9f8214ee4f5883738dad130e,0x1885bf0a04c6948061007cb556935a903b1bed95,0xd3ce03dfcc6b95c55f991b989b48bff28a9f3962,0xc95efc83de5832510dac2c29198279eb8662d77e --password ~/Desktop/keys/kovan.txt --keys-path ~/Desktop/keys/ --mode active --geth --force-ui`

`APP_ID=$FLIGHT_STAT_APP_ID APP_KEY=$FLIGHT_STAT_APP_KEY npm run prod-mode`

`npm run recompile`

`npm run deploy -- --network kovan`

## Degugging

`npm run console`

`const FDNewPolicyAt = ""`

`FlightDelayNewPolicy.at(FDNewPolicyAt).allEvents({fromBlock: 0}).watch((error, result) => { if(result.args.str_reason) { console.log(result.event, web3.toAscii(result.args.str_reason)) } else { console.log(result.event, result.args) } })`

`FlightDelayNewPolicy.at(FDNewPolicyAt).allEvents({fromBlock: 0}).get((error, result) => { console.log(result) })`

`FlightDelayNewPolicy.at(FDNewPolicyAt).newPolicy("KL/1770", "/dep/2018/01/01", 1514764800, 1514808000, {from: web3.eth.coinbase, to: FDNewPolicyAt, value: web3.toWei(0.5, 'ether'), gas: 1000000})`

## Commit

You must clean FlightStat creds from source code before commit

`npm run prepare-commit`

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
