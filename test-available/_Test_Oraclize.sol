/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Payout contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "./../contracts/FlightDelayOraclizeInterface.sol";
import "./../contracts/FlightDelayConstants.sol";

contract _Test_Oraclize is FlightDelayOraclizeInterface, FlightDelayConstants

{


	bytes32 queryId;

	function _Test_Oraclize () payable {

	}

	function test_callIt() {

		queryId = oraclize_query(
			"URL",
			"json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0"
			);

// #ifdef debug
		LogBytes32('queryId', queryId);
// #endif

	}

	function __callback(bytes32 _queryId, string _result, bytes _proof) {

// #ifdef debug
		LogBytes32('queryId', _queryId);
		LogString('_result', _result);
		LogBytes('_proof', _proof);
// #endif

	} // __callback

}
