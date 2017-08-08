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

import "./FlightDelayControlledContract.sol";
import "./FlightDelayConstants.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayAccessControllerInterface.sol";
import "./FlightDelayLedgerInterface.sol";
import "./FlightDelayPayoutInterface.sol";
import "./FlightDelayOraclizeInterface.sol";
import "./strings.sol";
import "./convertLib.sol";


contract FlightDelayPayout is

	FlightDelayControlledContract,
	FlightDelayConstants,
	FlightDelayOraclizeInterface,
	convertLib

{

	using strings for *;

	FlightDelayDatabaseInterface FD_DB;
	FlightDelayLedgerInterface FD_LG;
	FlightDelayAccessControllerInterface FD_AC;

	function FlightDelayPayout(address _controller) payable {

		setController(_controller, 'FD.Payout');

	}

	function setContracts() onlyController {

		FD_AC = FlightDelayAccessControllerInterface(getContract('FD.AccessController'));
		FD_DB = FlightDelayDatabaseInterface(getContract('FD.Database'));
		FD_LG = FlightDelayLedgerInterface(getContract('FD.Ledger'));

		FD_AC.setPermissionById(101, 'FD.Underwrite');

	}

	function schedulePayoutOraclizeCall(uint _policyId, bytes32 _riskId, uint _oraclizeTime) {

		if (!FD_AC.checkPermission(101, msg.sender)) throw;

		bytes32 carrierFlightNumber;
		bytes32 departureYearMonthDay;
		uint arrivalTime;

		(carrierFlightNumber,departureYearMonthDay,arrivalTime) = FD_DB.getRiskParameters(_riskId);

		string memory oraclize_url = strConcat(
			oraclize_StatusBaseUrl,
			b32toString(carrierFlightNumber),
			b32toString(departureYearMonthDay),
			oraclizeStatusQuery
			);

		bytes32 queryId = oraclize_query(
			_oraclizeTime, 
			'nested', 
			oraclize_url, 
			oraclizeGas
			);
		
		FD_DB.createOraclizeCallback(
			queryId, 
			_policyId, 
			oraclizeState.ForPayout, 
			_oraclizeTime
			);

		LOG_OraclizeCall(_policyId, queryId, oraclize_url);

	} // schedulePayoutOraclizeCall


	function __callback(bytes32 _queryId, string _result, bytes _proof) onlyOraclize {

		uint policyId;
		uint oraclizeTime;
		(policyId, oraclizeTime) = FD_DB.getOraclizeCallback(_queryId);
		bytes32 riskId = FD_DB.getRiskId(policyId);

		// #ifdef debug
		LOG_string('im payout callback, result = ', _result);
		LOG_uint('policyId: ', policyId);
		LOG_uint_time('oTime', oraclizeTime);
		LOG_bytes32('riskId', riskId);
		// #endif

		var sl_result = _result.toSlice(); 	

		if (bytes(_result).length == 0) { // empty Result
			if (FD_DB.checkTime(_queryId, riskId, 180 minutes)) {
				LOG_PolicyManualPayout(policyId, 'No Callback at +120 min');
				return;
			} else {
				schedulePayoutOraclizeCall(policyId, riskId, oraclizeTime + 45 minutes); 
			}
		} else {

			// first check status
			// extract the status field:
			sl_result.find('"'.toSlice()).beyond('"'.toSlice());
			sl_result.until(sl_result.copy().find('"'.toSlice()));
			bytes1 status = bytes(sl_result.toString())[0];	// s = L
			if (status == 'C') {
				// flight cancelled --> payout
				payOut(policyId, 4, 0);
				return;
			} else if (status == 'D') {
				// flight diverted --> payout					
				payOut(policyId, 5, 0);
				return;
			} else if (status != 'L' && status != 'A' && status != 'C' && status != 'D') {
				LOG_PolicyManualPayout(policyId, 'Unprocessable status');
				return;
			}
		
			// process the rest of the response:
			sl_result = _result.toSlice();
			bool arrived = sl_result.contains('actualGateArrival'.toSlice());

			if (status == 'A' || (status == 'L' && !arrived)) {
				// flight still active or not at gate --> reschedule
				if (FD_DB.checkTime(_queryId, riskId, 180 minutes)) {
					LOG_PolicyManualPayout(policyId, 'No arrival at +180 min');
				} else {
					schedulePayoutOraclizeCall(policyId, riskId, oraclizeTime + 45 minutes);
				}
			} else if (status == 'L' && arrived) {


				var aG = '"arrivalGateDelayMinutes": '.toSlice();
				if (sl_result.contains(aG)) { 
					sl_result.find(aG).beyond(aG);
					sl_result.until(sl_result.copy().find('"'.toSlice()).beyond('"'.toSlice())); 
					sl_result.until(sl_result.copy().find('\x7D'.toSlice())); // truffle bug, replace by "}" as soon as it is fixed.
					sl_result.until(sl_result.copy().find(','.toSlice())); 
					uint delayInMinutes = parseInt(sl_result.toString());

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
	
	} // prepare_payout


	function payOut(uint _policyId, uint8 _delay, uint _delayInMinutes)	internal {
		
		// #ifdef debug
		LOG_string('im payOut', '');
		LOG_uint('policyId', _policyId);
		LOG_uint('delay', _delay);
		LOG_uint('in minutes', _delayInMinutes);
		// #endif

		FD_DB.setDelay(_policyId, _delay, _delayInMinutes);

		if (_delay == 0) {

			FD_DB.setState(_policyId, policyState.Expired, now, 'Expired - no delay!');

		} else {

			uint premium;
			uint weight;
			address customer;

			(customer, weight, premium) = FD_DB.getPolicyData(_policyId);

// #ifdef debug
			LOG_uint('weight', weight);
// #endif

			if (weight == 0) weight = 20000;

			uint payout = premium * weightPattern[_delay] * 10000 / weight;
			uint calculatedPayout = payout;

			if (payout > maxPayout) {
				payout = maxPayout;
			}

			FD_DB.setPayouts(_policyId, calculatedPayout, payout);

			if (!FD_LG.sendFunds(customer, Acc.Payout, payout))  {
				FD_DB.setState(_policyId, policyState.SendFailed, now, 'Payout, send failed!');
				FD_DB.setPayouts(_policyId, calculatedPayout, 0);
			}
			else {
				FD_DB.setState(_policyId, policyState.PaidOut, now, 'Payout successful!');
			}

		}

	}

}