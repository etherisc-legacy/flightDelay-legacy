/*

	FlightDelay with Oraclized Underwriting and Payout
	All times are UTC.
	Copyright (C) Christoph Mussenbrock, Stephan Karpischek


    Contract Interfaces

*/

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./usingOraclize.sol";

contract FlightDelayOraclizeInterface is usingOraclize {

	modifier onlyOraclize () {
		if (msg.sender != oraclize_cbAddress()) throw;
		_;
	}

	function FlightDelayOraclizeInterface () {

// #ifdef testing
		// oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
		// for ethereum-bridge, discard after testing
		OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
// #endif
	}

}
