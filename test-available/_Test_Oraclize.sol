/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Payout contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayOraclizeInterface.sol";
import "./FlightDelayConstants.sol";

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
		LOG_bytes32('queryId', queryId);
// #endif

	}

	function __callback(bytes32 _queryId, string _result, bytes _proof) {

// #ifdef debug
		LOG_bytes32('queryId', _queryId);
		LOG_string('_result', _result);
		LOG_bytes('_proof', _proof);
// #endif

	} // __callback

}
