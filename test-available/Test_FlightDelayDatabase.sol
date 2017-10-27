/**
 * Unit tests for FlightDelayDatabase
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 *
 */

pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FlightDelayDatabase.sol";
import "../contracts/convertLib.sol";


contract Test_FlightDelayDatabase is FlightDelayDatabaseModel {

	// Fixture
	uint policyId;
	bytes32 riskId;
	FlightDelayDatabase FD_DB;
	bytes32 carrierFlightNumber = 'LH/410';
	bytes32 departureYearMonthDay = '/dep/2017/01/25';
	uint arrivalTime = 1485385200;
	uint cumulatedWeightedPremium = 1234;
	uint premiumMultiplier = 5678;
	address customer = 0x778f1506ad76255af12f20ab7e96b41f39001166; // some random valid address
	uint premium = 1234567 szabo;
	oraclizeState oState = oraclizeState.ForPayout;
	bytes32 queryId = sha3('Hello World'); // just some random string and hash

	function test_initialize() {

		FD_DB = FlightDelayDatabase(DeployedAddresses.FlightDelayDatabase());

	}

	function test_set_get_RiskParameters () {

		riskId = FD_DB.createUpdateRisk(carrierFlightNumber, departureYearMonthDay, arrivalTime);

		Assert.equal(riskId, sha3(carrierFlightNumber, departureYearMonthDay, arrivalTime), "riskId should be correct");

		bytes32 cfn;
		bytes32 dmy;
		uint at;
		(cfn, dmy, at) = FD_DB.getRiskParameters(riskId);

		Assert.equal(cfn, carrierFlightNumber, "carrierFlightNumber should be correct");
		Assert.equal(dmy, departureYearMonthDay, "departureYearMonthDay should be correct");
		Assert.equal(at, arrivalTime, "arrivalTime should be correct");

	}

	function test_set_get_PremiumFactors() {

		FD_DB.setPremiumFactors(riskId, cumulatedWeightedPremium, premiumMultiplier);
		uint cw;
		uint pm;
		(cw, pm) = FD_DB.getPremiumFactors(riskId);

		Assert.equal(cw, cumulatedWeightedPremium, "cumulatedWeightedPremium should be correct");
		Assert.equal(pm, premiumMultiplier, "cumulatedWeightedPremium should be correct");

	}

	function test_set_get_Policy() {


		policyId = FD_DB.createPolicy(customer, premium, riskId);

		Assert.equal(FD_DB.getRiskId(policyId), riskId, "policy should have correct riskId");

		address cu;
		uint pr;
		(cu,pr) = FD_DB.getCustomerPremium(policyId);
		Assert.equal(cu, customer, "policy should have correct customer");
		Assert.equal(pr, premium, "policy should have correct premium");

	}

	function test_set_get_OraclizeCallback() {

		FD_DB.createOraclizeCallback(queryId, policyId, oState, arrivalTime);

		uint pId;
		uint aT;
		(pId, aT) = FD_DB.getOraclizeCallback(queryId);

		Assert.equal(pId, policyId, "oraclizeCallback should have correct policyId");
		Assert.equal(aT, arrivalTime, "oraclizeCallback should have correct arrivalTime");

	}


/*

	// Getter and Setter for oraclizeCallbacks

	function getOraclizeCallback(bytes32 _queryId) returns (uint _policyId, uint _arrivalTime) {
		_policyId = oraclizeCallbacks[_queryId].policyId;
		_arrivalTime = risks[policies[_policyId].riskId].arrivalTime;
	}


	function getOraclizePolicyId(bytes32 _queryId) returns (uint _policyId) {
		oraclizeCallback o = oraclizeCallbacks[_queryId];
		_policyId = o.policyId;
	}


	function createOraclizeCallback(
		bytes32 _queryId,
		uint _policyId,
		oraclizeState _oraclizeState,
		uint _oraclizeTime) {
		oraclizeCallbacks[_queryId] = oraclizeCallback(_policyId, _oraclizeState, _oraclizeTime);
	}

	// mixed

	function checkTime(bytes32 _queryId, bytes32 _riskId, uint _offset) returns (bool _result) {

		oraclizeCallback o = oraclizeCallbacks[_queryId];
		risk r = risks[_riskId];

		_result = o.oraclizeTime > r.arrivalTime + _offset;
	}
*/
}


