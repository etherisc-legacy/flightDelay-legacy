/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploys all the contracts and 
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

//var scanChain = require('./util/scanChain.js');
//var Web3 = require('web3');

//var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

var fs = require('fs');

var scanChain = {};
scanChain.contracts = [];

var getBlockTxR = function(bn) {
	return (web3.eth.getBlock(bn, true)
		.transactions
		.map(function(elem) {
			var txr = web3.eth.getTransactionReceipt(elem.hash);
			if (typeof txr.contractAddress !== 'undefined' && txr.contractAddress !== '' && txr.contractAddress !== null) {
				// console.log(txr.contractAddress, ' : ', txr.gasUsed);
				scanChain.contracts[txr.contractAddress] = txr.gasUsed;
			}
			return txr;
		}));
};

scanChain.getAllBlocks = function() {

	var lastBlock = JSON.parse(fs.readFileSync('blockNumber.json')).blockNumber;

	for (var i = 302; i <= lastBlock; i++ ) {
		getBlockTxR(i);
	}

};

module.exports = function(deployer) {
  
	var FD_CT = FlightDelayController.deployed();

	// estimateGas == 201000
	FD_CT.setAllContracts({gas: 3000000});

	scanChain.getAllBlocks();
	
	console.log('FlightDelayController      : ', scanChain.contracts[FlightDelayController.address]);
	console.log('FlightDelayAccessController: ', scanChain.contracts[FlightDelayAccessController.address]);
	console.log('FlightDelayDatabase        : ', scanChain.contracts[FlightDelayDatabase.address]);
	console.log('FlightDelayLedger          : ', scanChain.contracts[FlightDelayLedger.address]);
	console.log('FlightDelayNewPolicy       : ', scanChain.contracts[FlightDelayNewPolicy.address]);
	console.log('FlightDelayUnderwrite      : ', scanChain.contracts[FlightDelayUnderwrite.address]);
	console.log('FlightDelayPayout          : ', scanChain.contracts[FlightDelayPayout.address]);


	console.log('BlockNumber: ', web3.eth.blockNumber);
};
