/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Underwrite contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayControlledContract.sol";
import "./FlightDelayConstants.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayLedgerInterface.sol";
import "./FlightDelayUnderwriteInterface.sol";
import "./FlightDelayPayoutInterface.sol";
import "./FlightDelayOraclizeInterface.sol";

import "./strings.sol";
import "./convertLib.sol";

contract FlightDelayUnderwrite is
	FlightDelayControlledContract,
	FlightDelayConstants,
	FlightDelayOraclizeInterface,
	convertLib {

	using strings for *;

	FlightDelayDatabaseInterface FD_DB;
	FlightDelayLedgerInterface FD_LG;
	FlightDelayPayoutInterface FD_PY;
	FlightDelayAccessControllerInterface FD_AC;

	function FlightDelayUnderwrite(address _controller) payable {
		setController(_controller, 'FD.Underwrite');
	}

	function setContracts() onlyController {
		FD_AC = FlightDelayAccessControllerInterface(getContract('FD.AccessController'));
		FD_DB = FlightDelayDatabaseInterface(getContract('FD.Database'));
		FD_LG = FlightDelayLedgerInterface(getContract('FD.Ledger'));
		FD_PY = FlightDelayPayoutInterface(getContract('FD.Payout'));

		FD_AC.setPermissionById(101, 'FD.NewPolicy');
	}

	function scheduleUnderwriteOraclizeCall(uint _policyId, bytes32 _carrierFlightNumber) {
		if (!FD_AC.checkPermission(101, msg.sender)) throw;

		string memory oraclize_url = strConcat(
			oraclize_RatingsBaseUrl,
			b32toString(_carrierFlightNumber),
			oraclizeRatingsQuery
		);

    // #ifdef debug
		LOG_uint('_policyId', _policyId);
		LOG_bytes32_str('_carrierFlightNumber',_carrierFlightNumber);
		LOG_string('oraclize_url', oraclize_url);
		LOG_address('OAR.getaddress()', OAR.getAddress());
    // #endif

		bytes32 queryId = oraclize_query('nested', oraclize_url, oraclizeGas);

		// call oraclize to get Flight Stats; this will also call underwrite()
		FD_DB.createOraclizeCallback(queryId, _policyId, oraclizeState.ForUnderwriting, 0);

		LOG_OraclizeCall(_policyId, queryId, oraclize_url);
	}

	function __callback(bytes32 _queryId, string _result, bytes _proof) /*onlyOraclize*/ {
    // #ifdef debug
		LOG_string('_result', _result);
    // #endif

		uint policyId;
		uint oraclizeTime;
		(policyId, oraclizeTime) = FD_DB.getOraclizeCallback(_queryId);

		var sl_result = _result.toSlice();

		// we expect result to contain 6 values, something like
		// "[61, 10, 4, 3, 0, 0]" ->
		// ['observations','late15','late30','late45','cancelled','diverted']
		if (bytes(_result).length == 0) {
			decline(policyId, 'Declined (empty result)', _proof);
		} else {
			// now slice the string using
			// https://github.com/Arachnid/solidity-stringutils
			if (sl_result.count(', '.toSlice()) != 5) {
				// check if result contains 6 values
				decline(policyId, 'Declined (invalid result)', _proof);
			} else {
				sl_result.beyond("[".toSlice()).until("]".toSlice());

				uint observations = parseInt(
					sl_result.split(', '.toSlice()).toString());

				// decline on < minObservations observations,
				// can't calculate reasonable probabibilities
				if (observations <= minObservations) {
					decline(policyId, 'Declined (too few observations)', _proof);
				} else {
					uint[6] memory statistics;
					// calculate statistics (scaled by 10000; 1% => 100)
					statistics[0] = observations;
					for(uint i = 1; i <= 5; i++) {
						statistics[i] =
							parseInt(
								sl_result.split(', '.toSlice()).toString())
								* 10000/observations;
					}

					// underwrite policy
					underwrite(policyId, statistics, _proof);
				}
			}
		}
	} // __callback

	function decline(uint _policyId, bytes32 _reason, bytes _proof)	internal {
		LOG_PolicyDeclined(_policyId, _reason);

		FD_DB.setState(_policyId, policyState.Declined, now, _reason);
		FD_DB.setWeight(_policyId, 0, _proof);

		address customer;
		uint premium;
		(customer, premium) = FD_DB.getCustomerPremium(_policyId);

		// TODO: LOG
		if (!FD_LG.sendFunds(customer, Acc.Premium, premium))  {
			FD_DB.setState(_policyId, policyState.SendFailed, now, 'decline: Send failed.');
		}
	}

	function underwrite(uint _policyId, uint[6] _statistics, bytes _proof) internal {
		uint premium;
		address customer;
		(customer, premium) = FD_DB.getCustomerPremium(_policyId); // throws if _policyId invalid
		bytes32 riskId = FD_DB.getRiskId(_policyId);

		uint cumulatedWeightedPremium;
		uint premiumMultiplier;
		(cumulatedWeightedPremium, premiumMultiplier) = FD_DB.getPremiumFactors(riskId);

		uint weight;
		for (uint8 i = 1; i <= 5; i++ ) {
			weight += weightPattern[i] * _statistics[i];
			// 1% = 100 / 100% = 10,000
		}
		// to avoid div0 in the payout section,
		// we have to make a minimal assumption on p.weight.
		if (weight == 0) { weight = 100000 / _statistics[0]; }

		// we calculate the factors to limit cluster risks.
		if (premiumMultiplier == 0) {
			// it's the first call, we accept any premium
			FD_DB.setPremiumFactors(riskId, premium * 100000 / weight, 100000 / weight);
		}

		FD_DB.setWeight(_policyId, weight, _proof);

		FD_DB.setState(_policyId, policyState.Accepted, now, 'Policy underwritten by oracle');

		LOG_PolicyAccepted(
			_policyId,
			_statistics[0],
			_statistics[1],
			_statistics[2],
			_statistics[3],
			_statistics[4],
			_statistics[5]
		);

		// schedule payout Oracle
		FD_PY.schedulePayoutOraclizeCall(_policyId, riskId, checkPayoutOffset);

	}
}
