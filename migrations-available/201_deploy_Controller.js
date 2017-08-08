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


module.exports = function(deployer) {
  
	var result = deployer.deploy(FlightDelayController, {value: web3.toWei(50, 'ether')});

	console.log(result);

};
