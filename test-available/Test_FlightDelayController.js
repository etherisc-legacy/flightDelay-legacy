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

contract('FlightDelayController', function(accounts) {


	it('should have FD.Database registered', function () {

		var FDC = FlightDelayController.deployed();

		return FDC.contractIds(0).then(function (_id){
			assert.equal('FD.Database', web3.toUtf8(_id));

		});

	});

	it('should have FD.Ledger registered', function () {

		var FDC = FlightDelayController.deployed();

		return FDC.contractIds(1).then(function (_id){
			assert.equal('FD.Ledger', web3.toUtf8(_id));

		});

	});

	it('should have FD.Payout registered', function () {

		var FDC = FlightDelayController.deployed();

		return FDC.contractIds(2).then(function (_id){
			assert.equal('FD.Payout', web3.toUtf8(_id));

		});

	});

	it('should have FD.Underwrite registered', function () {

		var FDC = FlightDelayController.deployed();

		return FDC.contractIds(3).then(function (_id){
			assert.equal('FD.Underwrite', web3.toUtf8(_id));

		});

	});

	it('should have FD.NewPolicy registered', function () {

		var FDC = FlightDelayController.deployed();

		return FDC.contractIds(4).then(function (_id){
			assert.equal('FD.NewPolicy', web3.toUtf8(_id));

		});

	});

}); // contract