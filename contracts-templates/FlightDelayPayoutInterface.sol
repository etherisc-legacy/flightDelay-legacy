/*

	FlightDelay with Oraclized Underwriting and Payout
	All times are UTC.
	Copyright (C) Christoph Mussenbrock, Stephan Karpischek

	
    Contract Interfaces
	
*/

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

contract FlightDelayPayoutInterface {
	
	function schedulePayoutOraclizeCall(uint _policyId, bytes32 _riskId, uint _offset) {}

}

