/**
 * Deployment script for FlightDelay
 *
 * @author Christoph Mussenbrock
 * @description Deploy FlightDelay_AddressResolver
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
/* eslint no-console: 0 */

var FlightDelay_AddressResolver	= artifacts.require('FlightDelay_AddressResolver.sol');

module.exports = function(deployer) {
  
	var result = deployer.deploy(FlightDelay_AddressResolver);
	console.log(result);

};
