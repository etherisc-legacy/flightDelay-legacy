const options = JSON.parse(process.argv[2] || '{}');
if (options.from === undefined || !options.network || !options.amount || !options.contractName) {
    console.log("Usage\nnode maintenanceMode.js '{\"contractName\": \"Ledger\", \"from\": \"0x63ce9f57e2e4b41d3451dec20ddb89143fd755bb\", \"network\": \"kovan\", \"amount\": 0.1}'");
    process.exit(1);
}

const Web3 = require('web3');
const truffle = require('../truffle');

const truffleConfig = truffle['networks'][options.network];
const web3 = new Web3(`http://${truffleConfig.host}:${truffleConfig.port}`);
const contracts = ['FlightDelayAddressResolver', 'FlightDelayController', 'FlightDelayNewPolicy', 'FlightDelayLedger', 'FlightDelayUnderwrite', 'FlightDelayPayout'];
let contractInstances = {};
contracts.forEach((name) => {
    const metaData = require(`../build/contracts/${name}.json`);
    contractInstances[name] = new web3.eth.Contract(metaData.abi);
});

(async () => {
    contractInstances['FlightDelayAddressResolver'].options.address = truffleConfig.addressResolver;

    const flightDelayNewPolicyAddress = await contractInstances['FlightDelayAddressResolver'].methods.getAddress().call();
    contractInstances['FlightDelayNewPolicy'].options.address = flightDelayNewPolicyAddress;

    const flightDelayControllerAddress = await contractInstances['FlightDelayNewPolicy'].methods.controller().call();
    contractInstances['FlightDelayController'].options.address = flightDelayControllerAddress;

    const flightDelayLedgerAddress = await contractInstances['FlightDelayController'].methods.contracts(web3.utils.toHex('FD.Ledger')).call();
    contractInstances['FlightDelayLedger'].options.address = flightDelayLedgerAddress.addr;

    const flightDelayUnderwriteAddress = await contractInstances['FlightDelayController'].methods.contracts(web3.utils.toHex('FD.Underwrite')).call();
    contractInstances['FlightDelayUnderwrite'].options.address = flightDelayUnderwriteAddress.addr;

    const flightDelayPayoutAddress = await contractInstances['FlightDelayController'].methods.contracts(web3.utils.toHex('FD.Payout')).call();
    contractInstances['FlightDelayPayout'].options.address = flightDelayPayoutAddress.addr;

    const data = contractInstances[`FlightDelay${options.contractName}`].methods.fund().encodeABI();
    console.log(`data: ${data}`);

    // submitTransaction
    const MultiSigWalletMetaData = require('./MultiSigWallet.json');
    const MultiSigWallet = new web3.eth.Contract(MultiSigWalletMetaData.abi, MultiSigWalletMetaData.networks[truffleConfig.network_id].address);
    MultiSigWallet.methods.submitTransaction(contractInstances[`FlightDelay${options.contractName}`]._address, web3.utils.toWei(options.amount), data).send({
        from: options.from,
        gas: 300000,
    }, (error, result) => {
        console.log(error, result);
    });

})();
