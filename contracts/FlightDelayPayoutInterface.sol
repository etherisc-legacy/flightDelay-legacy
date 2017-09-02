/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Payout contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;


contract FlightDelayPayoutInterface {

    function schedulePayoutOraclizeCall(uint _policyId, bytes32 _riskId, uint _offset);
}
