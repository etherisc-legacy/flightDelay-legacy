/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Underwrite contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

contract FlightDelayUnderwriteInterface {

	function scheduleUnderwriteOraclizeCall(uint _policyId, bytes32 _carrierFlightNumber) {}
}
