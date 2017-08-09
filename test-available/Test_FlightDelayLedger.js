/**
 * Unit tests for FlightDelayController
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */


contract('FlightDelayLedger', function(accounts) {


	it('should have a balance of 0 in all accounts at startup', function() {

		var FD_LG = FlightDelayLedger.deployed();

		return FD_LG.ledger(0).then(function(balance) {
			assert.equal(balance.valueOf(), 0, '0 wasnt in the first account');
		});

	}); // it



	it('should throw on invalid index', function() {

		var FD_LG = FlightDelayLedger.deployed();
		var itPasses = false;

		return FD_LG.ledger(6).then(function() {
			itPasses = true;
			assert.fail();
		}).catch(function() {
			return;
		}).then(function() {
			if (itPasses) {
				assert.fail('should throw, but doesn`t');
			} else {
				assert.isOk('it throws as expected');
			}
		});

	}); // it


	it('should have equal balances in accounts after booking', function() {

		var FD_LG = FlightDelayLedger.deployed();
		var ether_5 = web3.toWei(5, 'ether');

		return FD_LG.bookkeeping(0, 1, ether_5).then(function() {

			return FD_LG.ledger(0).then(function(balance_0) {

				assert.equal(-balance_0.valueOf(), ether_5);
				return FD_LG.ledger(1).then(function(balance_1) {
					assert.equal(balance_1.valueOf(), ether_5);
					assert.equal(-balance_0.valueOf(), balance_1.valueOf(), 'balances are not equal');
				});
			});
		});


	});

	it('should throw on overflow', function() {

		var FD_LG = FlightDelayLedger.deployed();

    // TODO: check if safeMath for various overflows in bookkeeping works.

	}); // it


}); // contract
