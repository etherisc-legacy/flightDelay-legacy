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

contract('_Test_Oraclize', function(accounts) {


	it('should schedule Oraclize Call', function() {

		var TO = _Test_Oraclize.deployed();
		var lf = new logformatter(TO, web3);

		return TO.test_callIt();

	}); // it

}); // contract
