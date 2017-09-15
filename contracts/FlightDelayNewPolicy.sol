/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description NewPolicy contract.
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

pragma solidity 0.4.13;

import "./FlightDelayControlledContract.sol";
import "./FlightDelayConstants.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayLedgerInterface.sol";
import "./FlightDelayUnderwriteInterface.sol";
import "./convertLib.sol";


contract FlightDelayNewPolicy is FlightDelayControlledContract, FlightDelayConstants, ConvertLib {

    FlightDelayAccessControllerInterface FD_AC;
    FlightDelayDatabaseInterface FD_DB;
    FlightDelayLedgerInterface FD_LG;
    FlightDelayUnderwriteInterface FD_UW;

    function FlightDelayNewPolicy(address _controller) {
        setController(_controller);
    }

    function setContracts() onlyController {
        FD_AC = FlightDelayAccessControllerInterface(getContract("FD.AccessController"));
        FD_DB = FlightDelayDatabaseInterface(getContract("FD.Database"));
        FD_LG = FlightDelayLedgerInterface(getContract("FD.Ledger"));
        FD_UW = FlightDelayUnderwriteInterface(getContract("FD.Underwrite"));

        FD_AC.setPermissionByAddress(101, 0x1);
        FD_AC.setPermissionById(103, "FD.Owner"); // check!
        FD_AC.setPermissionById(102, "FD.Controller"); // check!
    }

    function bookAndCalcRemainingPremium() internal returns (uint) {
        uint v = msg.value;
        uint reserve = v * RESERVE_PERCENT / 100;
        uint remain = v - reserve;
        uint reward = remain * REWARD_PERCENT / 100;

        // FD_LG.bookkeeping(Acc.Balance, Acc.Premium, v);
        FD_LG.bookkeeping(Acc.Premium, Acc.RiskFund, reserve);
        FD_LG.bookkeeping(Acc.Premium, Acc.Reward, reward);

        return (uint(remain - reward));
    }

    function maintenanceMode(bool _on) {
// --> debug-mode
//            LogBool('maintenanceMode', _on);
// <-- debug-mode
        if (FD_AC.checkPermission(103, msg.sender)) {
// --> debug-mode
//                LogAddress('Allowed permission 103', msg.sender);
// <-- debug-mode
            FD_AC.setPermissionByAddress(101, 0x1, _on);
        }
    }

    // create new policy
    function newPolicy(
        bytes32 _carrierFlightNumber,
        bytes32 _departureYearMonthDay,
        uint _departureTime,
        uint _arrivalTime) payable
    {

        // here we can switch it off.
        FD_AC.checkPermission(101, 0x1);

        // forward premium
        FD_LG.receiveFunds.value(msg.value)(Acc.Premium);

        // sanity checks:
        // don't Accept too low or too high policies

        if (msg.value < MIN_PREMIUM || msg.value > MAX_PREMIUM) {
            LogPolicyDeclined(0, "Invalid premium value");
            FD_LG.sendFunds(msg.sender, Acc.Premium, msg.value);
            return;
        }

        // don't Accept flights with departure time earlier than in 24 hours,
        // or arrivalTime before departureTime,
        // or departureTime after Mon, 26 Sep 2016 12:00:00 GMT
        uint dmy = toUnixtime(_departureYearMonthDay);

// --> debug-mode
//            LogUintTime("NewPolicy: dmy: ", dmy);
//            LogUintTime("NewPolicy: _departureTime: ", _departureTime);
// <-- debug-mode

        if (
            _arrivalTime < _departureTime || _arrivalTime > _departureTime + MAX_FLIGHT_DURATION || _departureTime < now + MIN_TIME_BEFORE_DEPARTURE || _departureTime > CONTRACT_DEAD_LINE || _departureTime < dmy || _departureTime > dmy + 24 hours
        ) {
            LogPolicyDeclined(0, "Invalid arrival/departure time");
            FD_LG.sendFunds(msg.sender, Acc.Premium, msg.value);
            return;
        }

        bytes32 riskId = FD_DB.createUpdateRisk(_carrierFlightNumber, _departureYearMonthDay, _arrivalTime);

        var (cumulatedWeightedPremium, premiumMultiplier) = FD_DB.getPremiumFactors(riskId);

        // roughly check, whether MAX_CUMULATED_WEIGHTED_PREMIUM will be exceeded
        // (we Accept the inAccuracy that the real remaining premium is 3% lower),
        // but we are conservative;
        // if this is the first policy, the left side will be 0
        if (msg.value * premiumMultiplier + cumulatedWeightedPremium >= MAX_CUMULATED_WEIGHTED_PREMIUM) {
            LogPolicyDeclined(0, "Cluster risk");
            FD_LG.sendFunds(msg.sender, Acc.Premium, msg.value);
            return;
        } else if (cumulatedWeightedPremium == 0) {
            // at the first police, we set r.cumulatedWeightedPremium to the max.
            // this prevents further polices to be Accepted, until the correct
            // value is calculated after the first callback from the oracle.
            FD_DB.setPremiumFactors(riskId, MAX_CUMULATED_WEIGHTED_PREMIUM, premiumMultiplier);
        }

        uint premium = bookAndCalcRemainingPremium();
        uint policyId = FD_DB.createPolicy(msg.sender, premium, riskId);

        if (premiumMultiplier > 0) {
            FD_DB.setPremiumFactors(
                riskId,
                cumulatedWeightedPremium + premium * premiumMultiplier,
                premiumMultiplier
            );
        }

        // now we have successfully applied
        FD_DB.setState(
            policyId,
            policyState.Applied,
            now,
            "Policy applied by customer"
        );

        LogPolicyApplied(
            policyId,
            msg.sender,
            _carrierFlightNumber,
            premium
        );

        FD_UW.scheduleUnderwriteOraclizeCall(policyId, _carrierFlightNumber);
    }
}
