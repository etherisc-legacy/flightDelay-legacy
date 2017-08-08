/**
 * Unit tests for FlightDelayDatabase
 *
 * @author Christoph Mussenbrock
 * @description t.b.d
 * @copyright (c) 2017 etherisc GmbH
 * 
 */


pragma solidity ^0.4.7;


import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

import "../contracts/FlightDelayNewPolicy.sol";


contract Test_FlightDelayNewPolicy {


	FlightDelayNewPolicy FD_NP;

	// Fixture
	bytes32 carrierFlightNumber = 'LH/410';
	bytes32 departureYearMonthDay = '/dep/2017/01/25';
	uint departureTime = 1485298800; // 2017/01/25
	uint arrivalTime = departureTime + 60*60*24;
	uint premium = 1234567 szabo;


	function test_initialize() {

		FD_NP = FlightDelayNewPolicy(DeployedAddresses.FlightDelayNewPolicy());

	}

	function test_newPolicy() {

		//FD_NP.newPolicy.value(premium)(carrierFlightNumber, departureYearMonthDay, departureTime, arrivalTime);

	}


}


