/*

	FlightDelay with Oraclized Underwriting and Payout
	All times are UTC.
	Copyright (C) Christoph Mussenbrock, Stephan Karpischek
	
*/


import "./github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "./github.com/Arachnid/solidity-stringutils/strings.sol";

contract FlightDelay is usingOraclize {

	using strings for *;

	modifier noEther { if (msg.value > 0) throw; _ }
	modifier onlyOwner { if (msg.sender != owner) throw; _ }
	modifier onlyOraclize {	if (msg.sender != oraclize_cbAddress()) throw; _ }

	modifier onlyInState (uint _policyId, policyState _state) {

		policy p = policies[_policyId];
		if (p.state != _state) throw;
		_

	}

	modifier onlyCustomer(uint _policyId) {

		policy p = policies[_policyId];
		if (p.customer != msg.sender) throw;
		_

	}

	modifier notInMaintenance {
		healthCheck();
		if (maintenance_mode >= maintenance_Emergency) throw;
		_
	}

	// the following modifier is always checked at last, so previous modifiers
	// may throw without affecting reentrantGuard
	modifier noReentrant {
		if (reentrantGuard) throw;
		reentrantGuard = true;
		_
		reentrantGuard = false;
	}

	// policy Status Codes and meaning:
	//
	// 00 = Applied:	the customer has payed a premium, but the oracle has
	//					not yet checked and confirmed.
	//					The customer can still revoke the policy.
	// 01 = Accepted:	the oracle has checked and confirmed.
	//					The customer can still revoke the policy.
	// 02 = Revoked:	The customer has revoked the policy.
	//					The premium minus cancellation fee is payed back to the
	//					customer by the oracle.
	// 03 = PaidOut:	The flight has ended with delay.
	//					The oracle has checked and payed out.
	// 04 = Expired:	The flight has endet with <15min. delay.
	//					No payout.
	// 05 = Declined:	The application was invalid.
	//					The premium minus cancellation fee is payed back to the
	//					customer by the oracle.
	// 06 = SendFailed:	During Revoke, Decline or Payout, sending ether failed
	//					for unknown reasons.
	//					The funds remain in the contracts RiskFund.


	//                  00       01        02       03
	enum policyState {Applied, Accepted, Revoked, PaidOut,
	//					04      05           06
					  Expired, Declined, SendFailed}

	// oraclize callback types:
	enum oraclizeState { ForUnderwriting, ForPayout }

	event LOG_PolicyApplied(
		uint policyId,
		address customer,
		string carrierFlightNumber,
		uint premium
	);
	event LOG_PolicyAccepted(
		uint policyId,
		uint statistics0,
		uint statistics1,
		uint statistics2,
		uint statistics3,
		uint statistics4,
		uint statistics5
	);
	event LOG_PolicyRevoked(
		uint policyId
	);
	event LOG_PolicyPaidOut(
		uint policyId,
		uint amount
	);
	event LOG_PolicyExpired(
		uint policyId
	);
	event LOG_PolicyDeclined(
		uint policyId,
		bytes32 reason
	);
	event LOG_PolicyManualPayout(
		uint policyId,
		bytes32 reason
	);
	event LOG_SendFail(
		uint policyId,
		bytes32 reason
	);
	event LOG_OraclizeCall(
		uint policyId,
		bytes32 queryId,
		string oraclize_url
	);
	event LOG_OraclizeCallback(
		uint policyId,
		bytes32 queryId,
		string result,
		bytes proof
	);
	event LOG_HealthCheck(
		bytes32 message, 
		int diff,
		uint balance,
		int ledgerBalance 
	);

	// some general constants for the system:
	// minimum observations for valid prediction
	uint constant minObservations 			= 10;
	// minimum premium to cover costs
	uint constant minPremium 				= 500 finney;
	// maximum premium
	uint constant maxPremium 				= 5 ether;
	// maximum payout
	uint constant maxPayout 				= 200 ether;
	// maximum number of identical risks
	uint8 constant maxIdenticalRisks		= 10;
	// 1 percent for DAO, 1 percent for maintainer
	uint8 constant rewardPercent 			= 2;
	// reserve for tail risks
	uint8 constant reservePercent 			= 1;
	// the weight pattern; in future versions this may become part of the policy struct.
	// currently can't be constant because of compiler restrictions
	// weightPattern[0] is not used, just to be consistent
    uint8[6] weightPattern 					= [0, 10,20,30,50,50];
	// Deadline for acceptance of policies: Mon, 26 Sep 2016 12:00:00 GMT
	uint contractDeadline 					= 1474891200; 

	// account numbers for the internal ledger:
	// sum of all Premiums of all currently active policies
	uint8 constant acc_Premium 				= 0;
	// Risk fund; serves as reserve for tail risks
	uint8 constant acc_RiskFund 			= 1;
	// sum of all payed out policies
	uint8 constant acc_Payout 				= 2;
	// the balance of the contract (negative!!)
	uint8 constant acc_Balance 				= 3;
	// the reward account for DAO and maintainer
	uint8 constant acc_Reward 				= 4;
	// oraclize costs
	uint8 constant acc_OraclizeCosts 		= 5;
	// when adding more accounts, remember to increase ledger array length

	// Maintenance modes 
	uint8 constant maintenance_None      	= 0;
	uint8 constant maintenance_BalTooHigh 	= 1;
	uint8 constant maintenance_Emergency 	= 255;
	
	
	// gas Constants for oraclize
	uint constant oraclizeGas 				= 500000;

	// URLs and query strings for oraclize

	string constant oraclize_RatingsBaseUrl =
		"[URL] json(https://api.flightstats.com/flex/ratings/rest/v1/json/flight/";
	string constant oraclizeRatingsQuery =
		"?${[decrypt] BDhAVBaQP2CS2VqQ/coqIStcYpSdSdLc1RJoC0gSoh++xsk6cBtLmJBHmB82X6mTMyzJXJPIvfa7ISzfwwhY+k8C3N+oP7htYGZ3N4INH03Uorw7Sif70hOw+xMR6PTX9ri2vkqiNwu9ensNkvTLyGd2l6NHJuij+RmgVw/mXGGZb9wHYC2T}).ratings[0]['observations','late15','late30','late45','cancelled','diverted']";

	// [URL] json(https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/LH/410/dep/2016/09/01?appId={appId}&appKey={appKey})
	string constant oraclize_StatusBaseUrl =
	  "[URL] json(https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/";
	string constant oraclizeStatusQuery =
		"?${[decrypt] BDhAVBaQP2CS2VqQ/coqIStcYpSdSdLc1RJoC0gSoh++xsk6cBtLmJBHmB82X6mTMyzJXJPIvfa7ISzfwwhY+k8C3N+oP7htYGZ3N4INH03Uorw7Sif70hOw+xMR6PTX9ri2vkqiNwu9ensNkvTLyGd2l6NHJuij+RmgVw/mXGGZb9wHYC2T}).flightStatuses[0]['status','delays','operationalTimes']";


	// the policy structure: this structure keeps track of the individual parameters of a policy.
	// typically customer address, premium and some status information.

	struct policy {

		// 0 - the customer
		address customer;
		// 1 - premium
		uint premium;

		// risk specific parameters:
		// 2 - pointer to the risk in the risks mapping
		bytes32 riskId;
		// custom payout pattern
		// in future versions, customer will be able to tamper with this array.
		// to keep things simple, we have decided to hard-code the array for all policies.
		// uint8[5] pattern;
		// 3 - probability weight. this is the central parameter
		uint weight;
		// 4 - calculated Payout
		uint calculatedPayout;
		// 5 - actual Payout
		uint actualPayout;

		// status fields:
		// 6 - the state of the policy
		policyState state;
		// 7 - time of last state change
		uint stateTime;
		// 8 - state change message/reason
		bytes32 stateMessage;
		// 9 - TLSNotary Proof
		bytes proof;
	}

	// the risk structure; this structure keeps track of the risk-specific parameters.
	// several policies can share the same risk structure (typically some people flying
	// with the same plane)

	struct risk {

		// 0 - Airline Code + FlightNumber
		string carrierFlightNumber;
		// 1 - scheduled departure and arrival time in the format /dep/YYYY/MM/DD
		string departureYearMonthDay;
		// 2 - the inital arrival time
		uint arrivalTime;
		// 3 - the final delay in minutes
		uint delayInMinutes;
		// 4 - the determined delay category (0-5)
		uint8 delay;
		// 5 - counter; limit the number of identical risks.
		uint8 counter;
	}

	// the oraclize callback structure: we use several oraclize calls.
	// all oraclize calls will result in a common callback to __callback(...).
	// to keep track of the different querys we have to introduce this struct.

	struct oraclizeCallback {

		// for which policy have we called?
		uint policyId;
		// for which purpose did we call? {ForUnderwrite | ForPayout}
		oraclizeState oState;
		uint oraclizeTime;

	}

	address public owner;

	// Table of policies
	policy[] public policies;
	// Lookup policyIds from customer addresses
	mapping (address => uint[]) public customerPolicies;
	// Lookup policy Ids from queryIds
	mapping (bytes32 => oraclizeCallback) public oraclizeCallbacks;
	mapping (bytes32 => risk) public risks;
	// Internal ledger
	int[6] public ledger;

	// invariant: acc_Premium + acc_RiskFund + acc_Payout
	//						+ acc_Balance + acc_Reward == 0

	// Mutex
	bool public reentrantGuard;
	uint8 public maintenance_mode;

	function healthCheck() internal {
		int diff = int(this.balance-msg.value) + ledger[acc_Balance];
		if (diff == 0) {
			return; // everything ok.
		}
		if (diff > 0) {
			LOG_HealthCheck('Balance too high', diff, this.balance, ledger[acc_Balance]);
			maintenance_mode = maintenance_BalTooHigh;
		} else {
			LOG_HealthCheck('Balance too low', diff, this.balance, ledger[acc_Balance]);
			maintenance_mode = maintenance_Emergency;
		}
	}

	// manually perform healthcheck.
	// @param _maintenance_mode: 
	// 		0 = reset maintenance_mode, even in emergency
	// 		1 = perform health check
	//    255 = set maintenance_mode to maintenance_emergency (no newPolicy anymore)
	function performHealthCheck(uint8 _maintenance_mode) onlyOwner {
		maintenance_mode = _maintenance_mode;
		if (maintenance_mode > 0 && maintenance_mode < maintenance_Emergency) {
			healthCheck();
		}
	}

	function payReward() onlyOwner {

		if (!owner.send(this.balance)) throw;
		maintenance_mode = maintenance_Emergency; // don't accept any policies

	}

	function bookkeeping(uint8 _from, uint8 _to, uint _amount) internal {

		ledger[_from] -= int(_amount);
		ledger[_to] += int(_amount);

	}

	// if ledger gets corrupt for unknown reasons, have a way to correct it:
	function audit(uint8 _from, uint8 _to, uint _amount) onlyOwner {

		bookkeeping (_from, _to, _amount);

	}

	function getPolicyCount(address _customer)
		constant returns (uint _count) {
		return policies.length;
	}

	function getCustomerPolicyCount(address _customer)
		constant returns (uint _count) {
		return customerPolicies[_customer].length;
	}

	function bookAndCalcRemainingPremium() internal returns (uint) {

		uint v = msg.value;
		uint reserve = v * reservePercent / 100;
		uint remain = v - reserve;
		uint reward = remain * rewardPercent / 100;

		bookkeeping(acc_Balance, acc_Premium, v);
		bookkeeping(acc_Premium, acc_RiskFund, reserve);
		bookkeeping(acc_Premium, acc_Reward, reward);

		return (uint(remain - reward));

	}

	// constructor
	function FlightDelay () {

		owner = msg.sender;
		reentrantGuard = false;
		maintenance_mode = maintenance_None;

		// initially put all funds in risk fund.
		bookkeeping(acc_Balance, acc_RiskFund, msg.value);
		oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);

	}

	// create new policy
	function newPolicy(
		string _carrierFlightNumber, 
		string _departureYearMonthDay, 
		uint _departureTime, 
		uint _arrivalTime
		) 
		notInMaintenance {

		// sanity checks:

		// don't accept to low or to high policies

		if (msg.value < minPremium || msg.value > maxPremium) {
			LOG_PolicyDeclined(0, 'Invalid premium value');
			if (!msg.sender.send(msg.value)) {
				LOG_SendFail(0, 'newPolicy sendback failed (1)');
			}
			return;
		}

        // don't accept flights with departure time earlier than in 24 hours, 
		// or arrivalTime before departureTime, or departureTime after Mon, 26 Sep 2016 12:00:00 GMT
        if (
			_arrivalTime < _departureTime ||
			_arrivalTime > _departureTime + 2 days ||
			_departureTime < now + 24 hours ||
			_departureTime > contractDeadline) {
			LOG_PolicyDeclined(0, 'Invalid arrival/departure time');
			if (!msg.sender.send(msg.value)) {
				LOG_SendFail(0, 'newPolicy sendback failed (2)');
			}
			return;
        }
		
		// accept only a number of maxIdenticalRisks identical risks:
		
		bytes32 riskId = sha3(_carrierFlightNumber, _departureYearMonthDay, _arrivalTime);
		risk r = risks[riskId];
	
		if (r.counter >= maxIdenticalRisks) {
			LOG_PolicyDeclined(0, 'To many identical risks');
			if (!msg.sender.send(msg.value)) {
				LOG_SendFail(0, 'newPolicy sendback failed (3)');
			}
			return;
		}

		// store or update policy
		uint policyId = policies.length++;
		customerPolicies[msg.sender].push(policyId);
		policy p = policies[policyId];

		p.customer = msg.sender;
		p.premium = bookAndCalcRemainingPremium();
		p.riskId = riskId;
		// the remaining premium after deducting reserve and reward

		// store risk parameters
		// Airline Code
		if (r.counter == 0) {
			// we have a new struct
			r.carrierFlightNumber = _carrierFlightNumber;
			r.departureYearMonthDay = _departureYearMonthDay;
			r.arrivalTime = _arrivalTime;
		} 
		// increase counter;
		r.counter += 1;

		// now we have successfully applied
		p.state = policyState.Applied;
		p.stateMessage = 'Policy applied by customer';
		p.stateTime = now;
		LOG_PolicyApplied(policyId, msg.sender, _carrierFlightNumber, p.premium);

		// call oraclize to get Flight Stats; this will also call underwrite()
		getFlightStats(policyId, _carrierFlightNumber);
	}
	
	function underwrite(uint _policyId, uint[6] _statistics, bytes _proof) internal {

		policy p = policies[_policyId]; // throws if _policyId invalid
		for (uint8 i = 1; i <= 5; i++ ) {
			p.weight += weightPattern[i] * _statistics[i];
			// 1% = 100 / 100% = 10,000
		}
		// to avoid div0 in the payout section, we have to make a minimal assumption on p.weight.
		if (p.weight == 0) { p.weight = 100000 / _statistics[0]; }
		p.proof = _proof;
		risk r = risks[p.riskId];

		// schedule payout Oracle
		schedulePayoutOraclizeCall(
			_policyId, 
			r.carrierFlightNumber, 
			r.departureYearMonthDay, 
			r.arrivalTime + 15 minutes
		);

		p.state = policyState.Accepted;
		p.stateMessage = 'Policy underwritten by oracle';
		p.stateTime = now;

		LOG_PolicyAccepted(
			_policyId, 
			_statistics[0], 
			_statistics[1], 
			_statistics[2], 
			_statistics[3], 
			_statistics[4],
			_statistics[5]
		);

	}
	
	function decline(uint _policyId, bytes32 _reason, bytes _proof)	internal {

		policy p = policies[_policyId];

		p.state = policyState.Declined;
		p.stateMessage = _reason;
		p.stateTime = now; // won't be reverted in case of errors
		p.proof = _proof;
		bookkeeping(acc_Premium, acc_Balance, p.premium);

		if (!p.customer.send(p.premium))  {
			bookkeeping(acc_Balance, acc_RiskFund, p.premium);
			p.state = policyState.SendFailed;
			p.stateMessage = 'decline: Send failed.';
			LOG_SendFail(_policyId, 'decline sendfail');
		}
		else {
			LOG_PolicyDeclined(_policyId, _reason);
		}


	}
	
	function schedulePayoutOraclizeCall(
		uint _policyId, 
		string _carrierFlightNumber, 
		string _departureYearMonthDay, 
		uint _oraclizeTime) 
		internal {

		string memory oraclize_url = strConcat(
			oraclize_StatusBaseUrl,
			_carrierFlightNumber,
			_departureYearMonthDay,
			oraclizeStatusQuery
			);

		bytes32 queryId = oraclize_query(_oraclizeTime, 'nested', oraclize_url, oraclizeGas);
		bookkeeping(acc_OraclizeCosts, acc_Balance, uint((-ledger[acc_Balance]) - int(this.balance)));
		oraclizeCallbacks[queryId] = oraclizeCallback(_policyId, oraclizeState.ForPayout, _oraclizeTime);

		LOG_OraclizeCall(_policyId, queryId, oraclize_url);
	}

	function payOut(uint _policyId, uint8 _delay, uint _delayInMinutes)
		notInMaintenance
		onlyOraclize
		onlyInState(_policyId, policyState.Accepted)
		internal {

		policy p = policies[_policyId];
		risk r = risks[p.riskId];
		r.delay = _delay;
		r.delayInMinutes = _delayInMinutes;
		
		if (_delay == 0) {
			p.state = policyState.Expired;
			p.stateMessage = 'Expired - no delay!';
			p.stateTime = now;
			LOG_PolicyExpired(_policyId);
		} else {

			uint payout = p.premium * weightPattern[_delay] * 10000 / p.weight;
			p.calculatedPayout = payout;

			if (payout > maxPayout) {
				payout = maxPayout;
			}

			if (payout > uint(-ledger[acc_Balance])) { // don't go for chapter 11
				payout = uint(-ledger[acc_Balance]);
			}

			p.actualPayout = payout;
			bookkeeping(acc_Payout, acc_Balance, payout);      // cash out payout


			if (!p.customer.send(payout))  {
				bookkeeping(acc_Balance, acc_Payout, payout);
				p.state = policyState.SendFailed;
				p.stateMessage = 'Payout, send failed!';
				p.actualPayout = 0;
				LOG_SendFail(_policyId, 'payout sendfail');
			}
			else {
				p.state = policyState.PaidOut;
				p.stateMessage = 'Payout successful!';
				p.stateTime = now; // won't be reverted in case of errors
				LOG_PolicyPaidOut(_policyId, payout);
			}
		}

	}

	// fallback function: don't accept ether, except from owner
	function () onlyOwner {

		// put additional funds in risk fund.
		bookkeeping(acc_Balance, acc_RiskFund, msg.value);

	}

	// internal, so no reentrant guard neccessary
	function getFlightStats(
		uint _policyId,
		string _carrierFlightNumber)
		internal {

		// call oraclize and retrieve the number of observations from flightstats API
		// format https://api.flightstats.com/flex/ratings/rest/v1/json/flight/OS/75?appId=**&appKey=**

		// using nested data sources (query type nested) and partial
		// encrypted queries in the next release of oraclize
		// note that the first call maps the encrypted string to the
		// sending contract address, this string can't be used from any other sender
		string memory oraclize_url = strConcat(
			oraclize_RatingsBaseUrl,
			_carrierFlightNumber,
			oraclizeRatingsQuery
			);

		bytes32 queryId = oraclize_query("nested", oraclize_url, oraclizeGas);
		// calculate the spent gas
		bookkeeping(acc_OraclizeCosts, acc_Balance, uint((-ledger[acc_Balance]) - int(this.balance)));
		oraclizeCallbacks[queryId] = oraclizeCallback(_policyId, oraclizeState.ForUnderwriting, 0);

		LOG_OraclizeCall(_policyId, queryId, oraclize_url);

	}

	// this is a dispatcher, but must be called __callback
	function __callback(bytes32 _queryId, string _result, bytes _proof) 
		onlyOraclize 
		noReentrant {

		oraclizeCallback memory o = oraclizeCallbacks[_queryId];
		LOG_OraclizeCallback(o.policyId, _queryId, _result, _proof);
		
		if (o.oState == oraclizeState.ForUnderwriting) {
            callback_ForUnderwriting(o.policyId, _result, _proof);
		}
        else {
            callback_ForPayout(_queryId, _result, _proof);
        }
	}

	function callback_ForUnderwriting(uint _policyId, string _result, bytes _proof) 
		onlyInState(_policyId, policyState.Applied)
		internal {

		var sl_result = _result.toSlice(); 		
		risk memory r = risks[policies[_policyId].riskId];

		// we expect result to contain 6 values, something like
		// "[61, 10, 4, 3, 0, 0]" ->
		// ['observations','late15','late30','late45','cancelled','diverted']

		if (bytes(_result).length == 0) {
			decline(_policyId, 'Declined (empty result)', _proof);
		} else {

			// now slice the string using
			// https://github.com/Arachnid/solidity-stringutils

			if (sl_result.count(', '.toSlice()) != 5) { // check if result contains 6 values
				decline(_policyId, 'Declined (invalid result)', _proof);
			} else {
				sl_result.beyond("[".toSlice()).until("]".toSlice());

				uint observations = parseInt(sl_result.split(', '.toSlice()).toString());

				// decline on < minObservations observations,
				// can't calculate reasonable probabibilities
				if (observations <= minObservations) {
					decline(_policyId, 'Declined (too few observations)', _proof);
				} else {
					uint[6] memory statistics;
					// calculate statistics (scaled by 100)
					statistics[0] = observations;
					for(uint i = 1; i <= 5; i++) {
						statistics[i] =
							parseInt(sl_result.split(', '.toSlice()).toString()) * 10000/observations;
					}

					// underwrite policy
					underwrite(_policyId, statistics, _proof);
				}
			}
		}
	} 

	function callback_ForPayout(bytes32 _queryId, string _result, bytes _proof) internal {

		oraclizeCallback memory o = oraclizeCallbacks[_queryId];
		uint policyId = o.policyId;
		var sl_result = _result.toSlice(); 		

		if (bytes(_result).length == 0) {
			// hmm ... bad! try again some minutes later ...
			schedulePayoutOraclizeCall(policyId, r.carrierFlightNumber, r.departureYearMonthDay, o.oraclizeTime + 45 minutes);
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
				risk memory r = risks[policies[policyId].riskId];
				if (o.oraclizeTime > r.arrivalTime + 120 minutes) {
					LOG_PolicyManualPayout(policyId, 'No arrival at +120 min');
				} else {
					schedulePayoutOraclizeCall(policyId, r.carrierFlightNumber, r.departureYearMonthDay, o.oraclizeTime + 45 minutes);
				}
			} else if (status == 'L' && arrived) {
				var aG = '"arrivalGateDelayMinutes": '.toSlice();
				if (sl_result.contains(aG)) {
					sl_result.find(aG).beyond(aG);
					sl_result.until(sl_result.copy().find('"'.toSlice()).beyond('"'.toSlice()));
					sl_result.until(sl_result.copy().find('}'.toSlice()));
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
	}
}


