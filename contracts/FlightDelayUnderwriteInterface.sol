/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Underwrite contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;


contract FlightDelayUnderwriteInterface {

    function scheduleUnderwriteOraclizeCall(uint _policyId, bytes32 _carrierFlightNumber);
}
