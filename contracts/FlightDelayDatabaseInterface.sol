/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Database contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;

import "./FlightDelayDatabaseModel.sol";


contract FlightDelayDatabaseInterface is FlightDelayDatabaseModel {

    function setAccessControl(address _contract, address _caller, uint8 _perm);

    function setAccessControl(
        address _contract,
        address _caller,
        uint8 _perm,
        bool _access
    );

    function getAccessControl(address _contract, address _caller, uint8 _perm) returns (bool _allowed);

    function setLedger(uint8 _index, int _value);

    function getLedger(uint8 _index) returns (int _value);

    function getCustomerPremium(uint _policyId) returns (address _customer, uint _premium);

    function getPolicyData(uint _policyId) returns (address _customer, uint _premium, uint _weight);

    function getPolicyState(uint _policyId) returns (policyState _state);

    function getRiskId(uint _policyId) returns (bytes32 _riskId);

    function createPolicy(address _customer, uint _premium, Currency _currency, bytes32 _customerExternalId, bytes32 _riskId) returns (uint _policyId);

    function setState(
        uint _policyId,
        policyState _state,
        uint _stateTime,
        bytes32 _stateMessage
    );

    function setWeight(uint _policyId, uint _weight, bytes _proof);

    function setPayouts(uint _policyId, uint _calculatedPayout, uint _actualPayout);

    function setDelay(uint _policyId, uint8 _delay, uint _delayInMinutes);

    function getRiskParameters(bytes32 _riskId)
        returns (bytes32 _carrierFlightNumber, bytes32 _departureYearMonthDay, uint _arrivalTime);

    function getPremiumFactors(bytes32 _riskId)
        returns (uint _cumulatedWeightedPremium, uint _premiumMultiplier);

    function createUpdateRisk(bytes32 _carrierFlightNumber, bytes32 _departureYearMonthDay, uint _arrivalTime)
        returns (bytes32 _riskId);

    function setPremiumFactors(bytes32 _riskId, uint _cumulatedWeightedPremium, uint _premiumMultiplier);

    function getOraclizeCallback(bytes32 _queryId)
        returns (uint _policyId, uint _arrivalTime);

    function getOraclizePolicyId(bytes32 _queryId)
    returns (uint _policyId);

    function createOraclizeCallback(
        bytes32 _queryId,
        uint _policyId,
        oraclizeState _oraclizeState,
        uint _oraclizeTime
    );

    function checkTime(bytes32 _queryId, bytes32 _riskId, uint _offset)
        returns (bool _result);
}
