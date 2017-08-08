#!/usr/bin/env node

/**
 * scan chain for contract creations.
 */

/* eslint no-console: 0 */

var Web3 = require('web3');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var scanChain = {};
scanChain.contracts = [];

var getBlockTxR = function(bn) {
	return (web3.eth.getBlock(bn, true)
		.transactions
		.map(function(elem) {
			var txr = web3.eth.getTransactionReceipt(elem.hash);
			if (typeof txr.contractAddress !== 'undefined' && txr.contractAddress !== '' && txr.contractAddress !== null) {
				console.log(txr.contractAddress, ' : ', txr.gasUsed);
				scanChain.contracts[txr.contractAddress] = txr.gasUsed;
			}
			return txr;
		}));
};

scanChain.getAllBlocks = function() {

	var lastBlock = web3.eth.blockNumber;

	for (var i = 0; i <= lastBlock; i++ ) {
		getBlockTxR(i);
	}

};

module.exports = scanChain;