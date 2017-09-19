// TODO AS: Perhaps, we should do it via FlightDelayPayout?
// payOut method calculates the payout and updates internal database

const Web3 = require('web3');
const options = JSON.parse(process.argv[2] || '{}');
if (!(options.network && options.amount && options.recepient)) {
    console.log("Usage\nnode withdraw.js '{\"amount\": \"100\", \"recepient\": \"<address>\", \"network\": \"kovan\"}'");
    process.exit(1);
}

const truffle = require('../truffle');
const truffleConfig = truffle['networks'][options.network];
const web3 = new Web3(`http://${truffleConfig.host}:${truffleConfig.port}`);

const ledgerMetadata = require('./../build/contracts/FlightDelayLedger.json');
const ledger = new web3.eth.Contract(ledgerMetadata.abi, ledgerMetadata.networks[truffleConfig.network_id].address);
// 2 is for Acc.Balance
const ledgerData = ledger.methods.sendFunds(options.recepient, 2, options.amount).encodeABI();

console.log(`data: ${ledgerData}`);

const MultiSigWalletMetaData = require('./MultiSigWallet.json');
const MultiSigWallet = new web3.eth.Contract(MultiSigWalletMetaData.abi, MultiSigWalletMetaData.networks[truffleConfig.network_id].address);

MultiSigWallet.methods.submitTransaction(ledgerMetadata.networks[truffleConfig.network_id].address, 0, ledgerData, 1000000).send({
    from: truffleConfig.from,
    gas: 3000000,
}, (error, result) => {
    console.log(error, result);
});

web3.eth.getBalance(
    ledgerMetadata.networks[truffleConfig.network_id].address,
    (error, result) => console.log('Ledger', error, result)
);

web3.eth.getBalance(
    '0xebf9a8df6f1adc7d18dbc49b7b656287b770b1bf',
    (error, result) => console.log('Customer', error, result)
);

// Debug events
// const events = MultiSigWallet.getPastEvents((error, logs) => {
//     console.log('Event', error, logs);
// });
