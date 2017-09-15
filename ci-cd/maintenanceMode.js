//todo: receive arguments
//todo: check with 2 owners
//todo: automate deploy multisig with 1 owner
//todo: add multisig support to deploy docker container
//
//todo: change address type to uint (0x1 to 1) node_modules/web3/packages/web3-eth/node_modules/web3-net/node_modules/web3-core/node_modules/web3-core-method/node_modules/web3-core-helpers/src/formatters.js
//todo: fix tests that work on belaf of account[1]
//todo: create more scripts (-set limitations, -fund subcontracts: ledger, underwrite, payout, +withdrow from subcontracts controller destructAll, -read/change permissions, -change owner of subcontracts, manual payout ledger sendFunds)

const Web3 = require('web3');
const options = JSON.parse(process.argv[2] || '{}');
if (options.access === undefined || !options.network) {
    console.log("Usage\nnode maintenanceMode.js '{\"access\": false, \"network\": \"kovan\"}'");
    process.exit(1);
}

const truffle = require('../truffle');
const truffleConfig = truffle['networks'][options.network];
const web3 = new Web3(`http://${truffleConfig.host}:${truffleConfig.port}`);
const newPolicyMetaData = require('./../build/contracts/FlightDelayNewPolicy.json');
const newPolicy = new web3.eth.Contract(newPolicyMetaData.abi, newPolicyMetaData.networks[truffleConfig.network_id].address);
const data = newPolicy.methods.maintenanceMode(options.access).encodeABI();
console.log(`data: ${data}`);

// submitTransaction
const MultiSigWalletMetaData = require('./MultiSigWallet.json');
const MultiSigWallet = new web3.eth.Contract(MultiSigWalletMetaData.abi, MultiSigWalletMetaData.networks[truffleConfig.network_id].address);
MultiSigWallet.methods.submitTransaction(newPolicyMetaData.networks[truffleConfig.network_id].address, 0, data, 100000).send({
    from: truffleConfig.from,
    gas: 300000,
}, (error, result) => {
    console.log(error, result);
});

// check accessControl
const databaseMetaData = require('./../build/contracts/FlightDelayDatabase.json');
const database = new web3.eth.Contract(databaseMetaData.abi, databaseMetaData.networks[truffleConfig.network_id].address);
database.methods.accessControl(newPolicyMetaData.networks[truffleConfig.network_id].address, '0x0000000000000000000000000000000000000001', 101).call({from: options.from}, (error, result) => {
    console.log(error, result);
});
