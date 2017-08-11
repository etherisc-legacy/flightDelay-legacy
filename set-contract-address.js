const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const newPolicy = require('./build/contracts/FlightDelayNewPolicy.json');

const abi = [{
  "constant": false,
  "inputs": [],
  "name": "getAddress",
  "outputs": [{"name": "oaddr", "type": "address"}],
  "payable": false,
  "type": "function"
}, {
  "constant": true,
  "inputs": [],
  "name": "addr",
  "outputs": [{"name": "", "type": "address"}],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "newowner", "type": "address"}],
  "name": "changeOwner",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {
  "constant": false,
  "inputs": [{"name": "newaddr", "type": "address"}],
  "name": "setAddr",
  "outputs": [],
  "payable": false,
  "type": "function"
}, {"inputs": [], "payable": false, "type": "constructor"}];

const resolvers = {
  kovan: {
    address: '0x2743D9318F599730FFf7E7992Ddeb3fF5Ae285e1',
    networkId: 42,
  },
};

// https://github.com/oraclize/ethereum-api/blob/master/connectors/addressResolver.sol
const resolver = resolvers[process.argv[process.argv.length - 1]];

const FlightDelayNewPolicy = new web3.eth.Contract(abi, resolver.address);

web3.eth.getCoinbase().then((coinbase) => {
    FlightDelayNewPolicy.methods.setAddr(
      newPolicy.networks[resolver.networkId].address
    ).send({from: coinbase}).on('receipt', function (receipt) {
      console.log('New contract address is saved in block', receipt.blockNumber);
    }).on('error', console.error);
  }
);
