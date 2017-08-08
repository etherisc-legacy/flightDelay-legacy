/**
 * Unit tests for FlightDelayNewPolicy
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var FlightDelayAccessController = artifacts.require('FlightDelayAccessController');
var FlightDelayController = artifacts.require('FlightDelayController');
var FlightDelayDatabase = artifacts.require('FlightDelayDatabase');
var FlightDelayLedger = artifacts.require('FlightDelayLedger');
var FlightDelayNewPolicy = artifacts.require('FlightDelayNewPolicy');
var FlightDelayUnderwrite = artifacts.require('FlightDelayUnderwrite');
var FlightDelayPayout = artifacts.require('FlightDelayPayout');

contract('FlightDelayNewPolicy', function(accounts) {


	it('should destroy all contracts and refund to owner', function() {

		var instances = [];
		var grandTotal = 0;

		return FlightDelayController.deployed()

		.then(function(instance) {
			instances.CT = instance;
			return FlightDelayAccessController.deployed();
		})

		.then(function(instance) {
			instances.AC = instance;
			return FlightDelayDatabase.deployed();
		})

		.then(function(instance) {
			instances.DB = instance;
			return FlightDelayLedger.deployed();
		})

		.then(function(instance) {
			instances.LG = instance;
			return FlightDelayNewPolicy.deployed();
		})

		.then(function(instance) {
			instances.NP = instance;
			return FlightDelayUnderwrite.deployed();
		})

		.then(function(instance) {
			instances.UW = instance;
			return FlightDelayPayout.deployed();
		})

		.then(function(instance) {
			instances.PY = instance;
			return web3.eth.getBalance(accounts[0]);
		})
		
		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal += Number(bal);
			console.log(grandTotal);
			console.log('Acc Balance before: ', bal);
			return web3.eth.getBalance(instances.CT.address);
		})

		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal += Number(bal);
			console.log('CT Balance: ', bal);
			return web3.eth.getBalance(instances.LG.address);
		})

		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal += Number(bal);
			console.log('LG Balance: ', bal);
			return web3.eth.getBalance(instances.UW.address);
		})

		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal += Number(bal);
			console.log('UW Balance: ', bal);
			return web3.eth.getBalance(instances.PY.address);
		})

		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal += Number(bal);
			console.log('PY Balance: ', bal);
			return instances.CT.destruct_all({
				from: accounts[0],
				gas: 4700000
			});

		})

		.then(function(tx) {
			return web3.eth.getBalance(accounts[0]);
		})

		.then(function(balance) {
			var bal = web3.fromWei(balance, 'ether').toFixed(2);
			grandTotal -= bal;
			console.log('Acc. Balance after: ', bal);
			console.log('Diff              : ', grandTotal.toFixed(2));
			assert(grandTotal < 0.1, 'Diff should be less than 0.01 ETH');

		});
	});



}); // contract