// https://raw.githubusercontent.com/gnosis/MultiSigWallet/master/contracts/MultiSigWallet.sol
const fs = require('fs');
const Web3 = require('web3');
const MultiSigWalletMetaData = require('./MultiSigWallet.json');
const truffle = require('../truffle');

module.exports = function (owners, required, network) {
  const truffleConfig = truffle['networks'][network];
  const web3 = new Web3(new Web3.providers.HttpProvider(`http://${truffleConfig.host}:${truffleConfig.port}`));
  let MultiSigWallet;

  return new web3.eth.Contract(MultiSigWalletMetaData.abi).deploy({
    data: MultiSigWalletMetaData.unlinked_binary,
    arguments: [owners, required]
  }).send({
    from: truffleConfig.from,
    gas: 6959005,
  }).then((w) => {
    MultiSigWallet = w;
  }).then(() => {
    // fund
    return web3.eth.sendTransaction({
      from: truffleConfig.from,
      to: MultiSigWallet.options.address,
      value: '100000000000000000'
    });
  }).then(() => {
    // save address
    MultiSigWalletMetaData.networks[truffleConfig.network_id].address = MultiSigWallet.options.address;
    fs.writeFileSync(`${__dirname}/MultiSigWallet.json`, JSON.stringify(MultiSigWalletMetaData, null, 4));
  }).then(() => {
    return MultiSigWallet;
  });
};
