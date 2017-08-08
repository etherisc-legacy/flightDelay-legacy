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

var logformatter = require('./logformatter.js');

contract('FlightDelayUnderwrite', function(accounts) {


	it('should schedule Oraclize Call', function() {

		var FD_UW = FlightDelayUnderwrite.deployed();
		var lf = new logformatter(FD_UW, web3);

		var policyId = 0;
		var carrierFlightNumber = 'LH/410';

		return FD_UW.scheduleUnderwriteOraclizeCall(policyId, carrierFlightNumber, {
			gas: 4700000,
		});

	}); // it

}); // contract