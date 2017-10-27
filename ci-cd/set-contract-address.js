const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const newPolicy = require('../build/contracts/FlightDelayNewPolicy.json');

const abi = [
    {
      "constant": true,
      "inputs": [],
      "name": "getAddress",
      "outputs": [
        {
          "name": "_addr",
          "type": "address"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "addr",
      "outputs": [
        {
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "changeOwner",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_addr",
          "type": "address"
        }
      ],
      "name": "setAddress",
      "outputs": [],
      "payable": false,
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "type": "constructor"
    }
  ];

const resolvers = {
    kovan: {
        address: '0x9e8e87e586e1337ac3207bd36f61a0e44619a24c',
        networkId: 42,
    },
    ropsten: {
        address: '0xc1cf879ca1c3bdfba7ea8c645823b48d4b8553ac',
        networkId: 3,
    },
    mainnet: {
        address: '',
        networkId: 1,
    },
};

// https://github.com/oraclize/ethereum-api/blob/master/connectors/addressResolver.sol
const resolver = resolvers[process.argv[process.argv.length - 1]];

const FlightDelayAddressResolver = new web3.eth.Contract(abi, resolver.address);

web3.eth.getCoinbase()
    .then((coinbase) => {
        FlightDelayAddressResolver
            .methods.setAddress(newPolicy.networks[resolver.networkId].address)
            .send({ from: coinbase, })
            .on('receipt', receipt =>
                console.log('New contract address is saved in block', receipt))
            .on('error', console.error);
    });
