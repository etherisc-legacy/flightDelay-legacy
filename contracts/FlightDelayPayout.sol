/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Payout contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

pragma solidity ^0.4.11;

import "./FlightDelayControlledContract.sol";
import "./FlightDelayConstants.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayLedgerInterface.sol";
import "./FlightDelayPayoutInterface.sol";
import "./FlightDelayOraclizeInterface.sol";
import "./convertLib.sol";
import "./../vendors/strings.sol";


contract FlightDelayPayout is FlightDelayControlledContract, FlightDelayConstants, FlightDelayOraclizeInterface, ConvertLib {

    using strings for *;

    FlightDelayDatabaseInterface FD_DB;
    FlightDelayLedgerInterface FD_LG;
    FlightDelayAccessControllerInterface FD_AC;

    /*
     * @dev Contract constructor sets its controller
     * @param _controller FD.Controller
     */
    function FlightDelayPayout(address _controller) {
        setController(_controller);
    }

    /*
     * Public methods
     */

    /*
     * @dev Set access permissions for methods
     */
    function setContracts() public onlyController {
        FD_AC = FlightDelayAccessControllerInterface(getContract("FD.AccessController"));
        FD_DB = FlightDelayDatabaseInterface(getContract("FD.Database"));
        FD_LG = FlightDelayLedgerInterface(getContract("FD.Ledger"));

        FD_AC.setPermissionById(101, "FD.Underwrite");
        FD_AC.setPermissionByAddress(101, oraclize_cbAddress());
        FD_AC.setPermissionById(102, "FD.Funder");
    }

    /*
     * @dev Fund contract
     */
    function fund() payable {
        require(FD_AC.checkPermission(102, msg.sender));

        // todo: bookkeeping
        // todo: fire funding event
    }

    /*
     * @dev Schedule oraclize call for payout
     * @param _policyId
     * @param _riskId
     * @param _oraclizeTime
     */
    function schedulePayoutOraclizeCall(uint _policyId, bytes32 _riskId, uint _oraclizeTime) public {
        require(FD_AC.checkPermission(101, msg.sender));

        var (carrierFlightNumber, departureYearMonthDay,) = FD_DB.getRiskParameters(_riskId);

        string memory oraclizeUrl = strConcat(
            ORACLIZE_STATUS_BASE_URL,
            b32toString(carrierFlightNumber),
            b32toString(departureYearMonthDay),
            ORACLIZE_STATUS_QUERY
        );

        bytes32 queryId = oraclize_query(
            _oraclizeTime,
            "nested",
            oraclizeUrl,
            ORACLIZE_GAS
        );

        FD_DB.createOraclizeCallback(
            queryId,
            _policyId,
            oraclizeState.ForPayout,
            _oraclizeTime
        );

        LogOraclizeCall(_policyId, queryId, oraclizeUrl, _oraclizeTime);
    }

    /*
     * @dev Oraclize callback. In an emergency case, we can call this directly from FD.Emergency Account.
     * @param _queryId
     * @param _result
     * @param _proof
     */
    function __callback(bytes32 _queryId, string _result, bytes _proof) public onlyOraclizeOr(getContract('FD.Emergency')) {

        var (policyId, oraclizeTime) = FD_DB.getOraclizeCallback(_queryId);
        LogOraclizeCallback(policyId, _queryId, _result, _proof);

        // check if policy was declined after this callback was scheduled
        var state = FD_DB.getPolicyState(policyId);
        require(uint8(state) != 5);

        bytes32 riskId = FD_DB.getRiskId(policyId);

// --> debug-mode
//            LogBytes32("riskId", riskId);
// <-- debug-mode

        var slResult = _result.toSlice();

        if (bytes(_result).length == 0) { // empty Result
            if (FD_DB.checkTime(_queryId, riskId, 180 minutes)) {
                LogPolicyManualPayout(policyId, "No Callback at +120 min");
                return;
            } else {
                schedulePayoutOraclizeCall(policyId, riskId, oraclizeTime + 45 minutes);
            }
        } else {
            // first check status
            // extract the status field:
            slResult.find("\"".toSlice()).beyond("\"".toSlice());
            slResult.until(slResult.copy().find("\"".toSlice()));
            bytes1 status = bytes(slResult.toString())[0];	// s = L
            if (status == "C") {
                // flight cancelled --> payout
                payOut(policyId, 4, 0);
                return;
            } else if (status == "D") {
                // flight diverted --> payout
                payOut(policyId, 5, 0);
                return;
            } else if (status != "L" && status != "A" && status != "C" && status != "D") {
                LogPolicyManualPayout(policyId, "Unprocessable status");
                return;
            }

            // process the rest of the response:
            slResult = _result.toSlice();
            bool arrived = slResult.contains("actualGateArrival".toSlice());

            if (status == "A" || (status == "L" && !arrived)) {
                // flight still active or not at gate --> reschedule
                if (FD_DB.checkTime(_queryId, riskId, 180 minutes)) {
                    LogPolicyManualPayout(policyId, "No arrival at +180 min");
                } else {
                    schedulePayoutOraclizeCall(policyId, riskId, oraclizeTime + 45 minutes);
                }
            } else if (status == "L" && arrived) {
                var aG = "\"arrivalGateDelayMinutes\": ".toSlice();
                if (slResult.contains(aG)) {
                    slResult.find(aG).beyond(aG);
                    slResult.until(slResult.copy().find("\"".toSlice()).beyond("\"".toSlice()));
                    // truffle bug, replace by "}" as soon as it is fixed.
                    slResult.until(slResult.copy().find("\x7D".toSlice()));
                    slResult.until(slResult.copy().find(",".toSlice()));
                    uint delayInMinutes = parseInt(slResult.toString());
                } else {
                    delayInMinutes = 0;
                }

                if (delayInMinutes < 15) {
                    payOut(policyId, 0, 0);
                } else if (delayInMinutes < 30) {
                    payOut(policyId, 1, delayInMinutes);
                } else if (delayInMinutes < 45) {
                    payOut(policyId, 2, delayInMinutes);
                } else {
                    payOut(policyId, 3, delayInMinutes);
                }
            } else { // no delay info
                payOut(policyId, 0, 0);
            }
        }
    }

    /*
     * Internal methods
     */

    /*
     * @dev Payout
     * @param _policyId
     * @param _delay
     * @param _delayInMinutes
     */
    function payOut(uint _policyId, uint8 _delay, uint _delayInMinutes)	internal {
// --> debug-mode
//            LogString("im payOut", "");
//            LogUint("policyId", _policyId);
//            LogUint("delay", _delay);
//            LogUint("in minutes", _delayInMinutes);
// <-- debug-mode

        FD_DB.setDelay(_policyId, _delay, _delayInMinutes);

        if (_delay == 0) {
            FD_DB.setState(
                _policyId,
                policyState.Expired,
                now,
                "Expired - no delay!"
            );
        } else {
            var (customer, weight, premium) = FD_DB.getPolicyData(_policyId);

// --> debug-mode
//                LogUint("weight", weight);
// <-- debug-mode

            if (weight == 0) {
                weight = 20000;
            }

            uint payout = premium * WEIGHT_PATTERN[_delay] * 10000 / weight;
            uint calculatedPayout = payout;

            if (payout > MAX_PAYOUT) {
                payout = MAX_PAYOUT;
            }

            FD_DB.setPayouts(_policyId, calculatedPayout, payout);

            if (!FD_LG.sendFunds(customer, Acc.Payout, payout)) {
                FD_DB.setState(
                    _policyId,
                    policyState.SendFailed,
                    now,
                    "Payout, send failed!"
                );

                FD_DB.setPayouts(_policyId, calculatedPayout, 0);
            } else {
                FD_DB.setState(
                    _policyId,
                    policyState.PaidOut,
                    now,
                    "Payout successful!"
                );
            }
        }
    }
}
