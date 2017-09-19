module.exports = (network_id, contractName, methodName, options) => {
    const Web3 = require('web3');
    const truffle = require(`${__dirname}/../truffle`);

    let truffleConfig = {};
    for (let [_, network] of Object.entries(truffle['networks'])) {
        if (network.network_id === parseInt(network_id)) truffleConfig = network;
    }
    const web3 = new Web3(`http://${truffleConfig.host}:${truffleConfig.port}`);

    const metaData = require(`${__dirname}/../build/contracts/${contractName}.json`);
    const contract = new web3.eth.Contract(metaData.abi, metaData.networks[truffleConfig.network_id].address);

    return contract.methods[methodName](...options).encodeABI();
};
