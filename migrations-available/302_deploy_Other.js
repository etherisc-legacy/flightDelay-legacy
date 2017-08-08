/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelayController 
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var FlightDelayController 				= artifacts.require('FlightDelayController.sol');
var FlightDelayAccessController 		= artifacts.require('FlightDelayAccessController.sol');
var FlightDelayDatabase					= artifacts.require('FlightDelayDatabase.sol');
var FlightDelayLedger					= artifacts.require('FlightDelayLedger.sol');
var FlightDelayNewPolicy 				= artifacts.require('FlightDelayNewPolicy.sol');
var FlightDelayUnderwrite				= artifacts.require('FlightDelayUnderwrite.sol');
var FlightDelayPayout					= artifacts.require('FlightDelayPayout.sol');



module.exports = function(deployer) {


	deployer.deploy(FlightDelayController, {value: web3.toWei(50, 'ether')})
	.then(function(){
		return deployer.deploy(FlightDelayAccessController, FlightDelayController.address);
	}).then(function () {
		return deployer.deploy(FlightDelayDatabase, FlightDelayController.address);
	}).then(function () {
		return deployer.deploy(FlightDelayLedger, FlightDelayController.address, {value: web3.toWei(500, 'ether')});
	}).then(function () {
		return deployer.deploy(FlightDelayNewPolicy, FlightDelayController.address);
	}).then(function () {
		return deployer.deploy(FlightDelayUnderwrite, FlightDelayController.address, {value: web3.toWei(50, 'ether')});
	}).then(function () {
		return deployer.deploy(FlightDelayPayout, FlightDelayController.address, {value: web3.toWei(50, 'ether')});
	}).then(function () {

		// finish, call setAllContracts on each
		FlightDelayController.deployed()
		.then(function (instance){

			return instance.setAllContracts({gas: 3000000});

		})
		.then(function (result){
			console.log(result);
		});

	});


};
