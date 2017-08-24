/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Database contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayControlledContract.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayConstants.sol";


contract FlightDelayDatabase is FlightDelayControlledContract, FlightDelayDatabaseInterface, FlightDelayConstants {

    // Table of policies
    Policy[] public policies;

    // Lookup policyIds from customer addresses
    mapping (address => uint[]) public customerPolicies;

    // Lookup policy Ids from queryIds
    mapping (bytes32 => OraclizeCallback) public oraclizeCallbacks;

    // Lookup risks from risk IDs
    mapping (bytes32 => Risk) public risks;

    // Lookup AccessControl
    mapping(address => mapping(address => mapping(uint8 => bool))) public accessControl;

    // Lookup accounts of internal ledger
    int[6] public ledger;

    FlightDelayAccessControllerInterface FD_AC;

    function FlightDelayDatabase (address _controller) {
        setController(_controller, "FD.Database");
    }

    function setContracts() onlyController {
        FD_AC = FlightDelayAccessControllerInterface(getContract("FD.AccessController"));

        FD_AC.setPermissionById(101, "FD.NewPolicy");
        FD_AC.setPermissionById(101, "FD.Underwrite");
        FD_AC.setPermissionById(101, "FD.Payout");
        FD_AC.setPermissionById(101, "FD.Ledger");
    }

    // Getter and Setter for AccessControl
    function setAccessControl(
        address _contract,
        address _caller,
        uint8 _perm,
        bool _access
    ) {
        // one and only hardcoded accessControl
        if (msg.sender != FD_CI.getContract("FD.AccessController")) {
            throw;
        }
        accessControl[_contract][_caller][_perm] = _access;
    }

    function setAccessControl(address _contract, address _caller, uint8 _perm) {
        setAccessControl(
            _contract,
            _caller,
            _perm,
            true
        );
    }

    function getAccessControl(address _contract, address _caller, uint8 _perm) returns (bool _allowed) {
        return accessControl[_contract][_caller][_perm];
    }

    // Getter and Setter for ledger
    function setLedger(uint8 _index, int _value) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        int previous = ledger[_index];
        ledger[_index] += _value;

        // #ifdef debug
        LogInt("previous", previous);
        LogInt("ledger[_index]", ledger[_index]);
        LogInt("_value", _value);
        // #endif

        // check for int overflow
        if (_value < 0 && ledger[_index] > previous) {
            throw;
        } else if (_value > 0 && ledger[_index] < previous) {
            throw;
        }
    }

    function getLedger(uint8 _index) returns (int _value) {
        return ledger[_index];
    }

    // Getter and Setter for policies
    function getCustomerPremium(uint _policyId) returns (address _customer, uint _premium) {
        Policy p = policies[_policyId];
        _customer = p.customer;
        _premium = p.premium;
    }

    function getPolicyData(uint _policyId) returns (address _customer, uint _weight, uint _premium) {
        Policy p = policies[_policyId];
        _customer = p.customer;
        _weight = p.weight;
        _premium = p.premium;
    }

    function getRiskId(uint _policyId) returns (bytes32 _riskId) {
        Policy p = policies[_policyId];
        _riskId = p.riskId;
    }

    function createPolicy(address _customer, uint _premium, bytes32 _riskId) returns (uint _policyId) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        _policyId = policies.length++;
        customerPolicies[_customer].push(_policyId);
        Policy p = policies[_policyId];

        p.customer = _customer;
        p.premium = _premium;
        p.riskId = _riskId;
    }

    function setState(
        uint _policyId,
        policyState _state,
        uint _stateTime,
        bytes32 _stateMessage
    ) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        LogSetState(
            _policyId,
            uint8(_state),
            _stateTime,
            _stateMessage
        );

        Policy p = policies[_policyId];

        p.state = _state;
        p.stateTime = _stateTime;
        p.stateMessage = _stateMessage;
    }

    function setWeight(uint _policyId, uint _weight, bytes _proof) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        Policy p = policies[_policyId];

        p.weight = _weight;
        p.proof = _proof;
    }

    function setPayouts(uint _policyId, uint _calculatedPayout, uint _actualPayout) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        Policy p = policies[_policyId];

        p.calculatedPayout = _calculatedPayout;
        p.actualPayout = _actualPayout;
    }

    function setDelay(uint _policyId, uint8 _delay, uint _delayInMinutes) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        Risk r = risks[policies[_policyId].riskId];

        r.delay = _delay;
        r.delayInMinutes = _delayInMinutes;
    }

    // Getter and Setter for risks
    function getRiskParameters(bytes32 _riskId) returns (bytes32 _carrierFlightNumber, bytes32 _departureYearMonthDay, uint _arrivalTime) {
        Risk r = risks[_riskId];
        _carrierFlightNumber = r.carrierFlightNumber;
        _departureYearMonthDay = r.departureYearMonthDay;
        _arrivalTime = r.arrivalTime;
    }

    function getPremiumFactors(bytes32 _riskId) returns (uint _cumulatedWeightedPremium, uint _premiumMultiplier) {
        Risk r = risks[_riskId];
        _cumulatedWeightedPremium = r.cumulatedWeightedPremium;
        _premiumMultiplier = r.premiumMultiplier;
    }

    function createUpdateRisk(bytes32 _carrierFlightNumber, bytes32 _departureYearMonthDay, uint _arrivalTime) returns (bytes32 _riskId) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        _riskId = sha3(
            _carrierFlightNumber,
            _departureYearMonthDay,
            _arrivalTime
        );

        Risk r = risks[_riskId];

        if (r.premiumMultiplier == 0) {
            r.carrierFlightNumber = _carrierFlightNumber;
            r.departureYearMonthDay = _departureYearMonthDay;
            r.arrivalTime = _arrivalTime;
        }
    }

    function setPremiumFactors(bytes32 _riskId, uint _cumulatedWeightedPremium, uint _premiumMultiplier) {
        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        Risk r = risks[_riskId];
        r.cumulatedWeightedPremium = _cumulatedWeightedPremium;
        r.premiumMultiplier = _premiumMultiplier;
    }

    // Getter and Setter for oraclizeCallbacks
    function getOraclizeCallback(bytes32 _queryId) returns (uint _policyId, uint _arrivalTime) {
        _policyId = oraclizeCallbacks[_queryId].policyId;
        _arrivalTime = risks[policies[_policyId].riskId].arrivalTime;
    }

    function getOraclizePolicyId(bytes32 _queryId) returns (uint _policyId) {
        OraclizeCallback o = oraclizeCallbacks[_queryId];
        _policyId = o.policyId;
    }

    function createOraclizeCallback(
        bytes32 _queryId,
        uint _policyId,
        oraclizeState _oraclizeState,
        uint _oraclizeTime) {

        if (!FD_AC.checkPermission(101, msg.sender)) {
            throw;
        }

        oraclizeCallbacks[_queryId] = OraclizeCallback(_policyId, _oraclizeState, _oraclizeTime);
    }

    // mixed
    function checkTime(bytes32 _queryId, bytes32 _riskId, uint _offset) returns (bool _result) {
        OraclizeCallback o = oraclizeCallbacks[_queryId];
        Risk r = risks[_riskId];

        _result = o.oraclizeTime > r.arrivalTime + _offset;
    }
}
