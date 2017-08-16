/*
 * Script to set addressresolver to deployed FlightDelayNewPolicy contract address
 *
 */


const network = process.argv[process.argv.length - 1];

const network_params = {
  kovan: {
    address: '0xa1eee690186f36e2b6d1d3ac17ee9ac7e503a0d3',
//    address: '0x9e8e87e586e1337ac3207bd36f61a0e44619a24c',
    networkId: 42,
    rpcport: 8745,
  },
  ropsten: {
    address: '0xc1cf879ca1c3bdfba7ea8c645823b48d4b8553ac',
    networkId: 3,
    rpcport: 8645, 
  },
  mainnet: {
    address: '',
    networkId: 1,
    rpcport: 8545, 
  },
};




const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:'+network_params[network].rpcport));
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

// https://github.com/oraclize/ethereum-api/blob/master/connectors/addressResolver.sol

const FlightDelay_AddressResolver = new web3.eth.Contract(abi, network_params[network].address);

web3.eth.getCoinbase().then((coinbase) => {
  FlightDelay_AddressResolver.methods.setAddr(
      newPolicy.networks[network_params[network].networkId].address
    ).send({from: coinbase}).on('receipt', function (receipt) {
      console.log('New contract address is saved in block', receipt);
    }).on('error', console.error);
  }
);
