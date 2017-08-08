/*

	FlightDelay with Oraclized Underwriting and Payout
	All times are UTC.
	Copyright (C) Christoph Mussenbrock, Stephan Karpischek

	
    Contract Interfaces
	
*/

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayDatabaseModel.sol";

contract FlightDelayLedgerInterface is FlightDelayDatabaseModel {

	function receiveFunds(Acc _to) payable;

	function sendFunds(address _recipient, Acc _from, uint _amount) returns (bool _success) {}

	function bookkeeping(Acc _from, Acc _to, uint amount) {}

}
