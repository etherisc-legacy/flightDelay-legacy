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
  
	var result = deployer.deploy(FlightDelayController, {value: web3.toWei(50, 'ether')});
	console.log(result);

};
