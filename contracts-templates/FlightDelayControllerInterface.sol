/*

	FlightDelay with Oraclized Underwriting and Payout
	All times are UTC.
	Copyright (C) Christoph Mussenbrock, Stephan Karpischek


    Contract Interfaces

*/

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');


contract FlightDelayControllerInterface {

  function selfRegister(bytes32 _id) returns (bool result) {}

  function getContract(bytes32 _id) returns (address _addr) {}

}

