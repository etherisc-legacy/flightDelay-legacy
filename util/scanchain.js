#!/usr/bin/env node

/**
 * scan chain for contract creations.
 */

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const scanChain = {};
scanChain.contracts = [];

const getBlockTxR = bn =>
  web3.eth.getBlock(bn, true)
    .transactions
    .map((elem) => {
      const txr = web3.eth.getTransactionReceipt(elem.hash);
      if (typeof txr.contractAddress !== 'undefined' && txr.contractAddress !== '' && txr.contractAddress !== null) {
        console.log(txr.contractAddress, ' : ', txr.gasUsed);
        scanChain.contracts[txr.contractAddress] = txr.gasUsed;
      }
      return txr;
    });

scanChain.getAllBlocks = () => {
  const lastBlock = web3.eth.blockNumber;

  for (let i = 0; i <= lastBlock; i += 1) {
    getBlockTxR(i);
  }
};

module.exports = scanChain;
