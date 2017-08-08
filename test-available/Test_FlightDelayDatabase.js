/**
 * Unit tests for FlightDelayDatabase
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 * 
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

contract('FlightDelayDatabase', function(accounts) {

	it('should store a risk', function () {

		var FD_DB = FlightDelayDatabase.deployed();

		var carrierFlightNumber = 'LH/410';

		var minute = 60;
		var hour = 60*minute;
		var day = 24*hour;

		var dmy = '2017/01/25';
		var dmy_unix = new Date(dmy).valueOf()/1000;
		var departureYearMonthDay = '/dep/' + dmy;
		var arrivalTime = dmy_unix + 1*day;

		return FD_DB.createUpdateRisk(
			carrierFlightNumber,
			departureYearMonthDay,
			arrivalTime).then(function() {

				assert.isOk('true', 'true');
			});

	} );


}); // contract