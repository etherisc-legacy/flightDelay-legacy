/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Database contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;

import "./FlightDelayControlledContract.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayConstants.sol";


/*
    This contract fixes a bug in getOraclizeCallback. All other functions are proxies to the FlightDelayDatabase functions.
    The contract is inserted between FlightDelayPayout and FlightDelayDatabase.
 */

contract FlightDelayFix is FlightDelayControlledContract, FlightDelayConstants {

    FlightDelayAccessControllerInterface FD_AC;
    FlightDelayDatabaseInterface FD_DB;

    function FlightDelayFix (address _controller) {
        setController(_controller);
    }

    function setContracts() onlyController {
        FD_AC = FlightDelayAccessControllerInterface(getContract("FD.AccessController"));
        FD_DB = FlightDelayDatabaseInterface(getContract("FD.Database.2"));

        FD_AC.setPermissionById(101, "FD.Payout");
 
    }

    function getPolicyData(uint _policyId) returns (address _customer, uint _weight, uint _premium) {
        return FD_DB.getPolicyData(_policyId);
    }

    function getPolicyState(uint _policyId) returns (policyState _state) {
        return FD_DB.getPolicyState(_policyId);
    }

    function getRiskId(uint _policyId) returns (bytes32 _riskId) {
        return FD_DB.getRiskId(_policyId);
    }

    function setState(
        uint _policyId,
        policyState _state,
        uint _stateTime,
        bytes32 _stateMessage
    ) {
        require(FD_AC.checkPermission(101, msg.sender));
        FD_DB.setState(_policyId, _state, _stateTime, _stateMessage);
    }

    function setPayouts(uint _policyId, uint _calculatedPayout, uint _actualPayout) {
        require(FD_AC.checkPermission(101, msg.sender));
        FD_DB.setPayouts(_policyId, _calculatedPayout, _actualPayout);
    }

    function setDelay(uint _policyId, uint8 _delay, uint _delayInMinutes) {
        require(FD_AC.checkPermission(101, msg.sender));
        FD_DB.setDelay(_policyId, _delay, _delayInMinutes);
    }

    function getRiskParameters(bytes32 _riskId) returns (bytes32 _carrierFlightNumber, bytes32 _departureYearMonthDay, uint _arrivalTime) {
        return FD_DB.getRiskParameters(_riskId);
    }

    function getOraclizeCallback(bytes32 _queryId) returns (uint _policyId, uint _oraclizeTime) {
        (_policyId,,_oraclizeTime) = FD_DB.oraclizeCallbacks(_queryId);
    }

    function createOraclizeCallback(
        bytes32 _queryId,
        uint _policyId,
        oraclizeState _oraclizeState,
        uint _oraclizeTime) {
        require(FD_AC.checkPermission(101, msg.sender));
        FD_DB.createOraclizeCallback(_queryId, _policyId, _oraclizeState, _oraclizeTime);
    }

    function checkTime(bytes32 _queryId, bytes32 _riskId, uint _offset) returns (bool _result) {
        return FD_DB.checkTime(_queryId, _riskId, _offset);
    }
}
