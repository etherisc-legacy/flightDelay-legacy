const Web3 = require('web3');
const options = JSON.parse(process.argv[2] || '{}');
if (!options.network) {
    console.log("Usage\nnode withdraw.js '{\"network\": \"kovan\"}'");
    process.exit(1);
}

const truffle = require('../truffle');
const truffleConfig = truffle['networks'][options.network];
const web3 = new Web3(`http://${truffleConfig.host}:${truffleConfig.port}`);

const controllerMetadata = require('./../build/contracts/FlightDelayController.json');
const controller = new web3.eth.Contract(controllerMetadata.abi, controllerMetadata.networks[truffleConfig.network_id].address);
const controllerData = controller.methods.destructAll().encodeABI();

console.log(`data: ${controllerData}`);

const MultiSigWalletMetaData = require('./MultiSigWallet.json');
const MultiSigWallet = new web3.eth.Contract(MultiSigWalletMetaData.abi, MultiSigWalletMetaData.networks[truffleConfig.network_id].address);

MultiSigWallet.methods.submitTransaction(controllerMetadata.networks[truffleConfig.network_id].address, 0, controllerData, 100000).send({
    from: truffleConfig.from,
    gas: 300000,
}, (error, result) => {
    console.log(error, result);
});

const ledgerMetadata = require('./../build/contracts/FlightDelayLedger.json');
const underwriteMetadata = require('./../build/contracts/FlightDelayUnderwrite.json');
const payoutMetadata = require('./../build/contracts/FlightDelayPayout.json');

web3.eth.getBalance(
    ledgerMetadata.networks[truffleConfig.network_id].address,
    (error, result) => console.log('Ledger', error, result)
);

web3.eth.getBalance(
    underwriteMetadata.networks[truffleConfig.network_id].address,
    (error, result) => console.log('Underwrite', error, result)
);

web3.eth.getBalance(
    payoutMetadata.networks[truffleConfig.network_id].address,
    (error, result) => console.log('Payout', error, result)
);

// Debug events
// const events = MultiSigWallet.getPastEvents((error, logs) => {
//     console.log('Event', error, logs);
// });
