/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Events and Constants.
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

contract FlightDelayConstants {

// #ifdef debug
	event LOG_uint(string _message, uint _uint);
	event LOG_uint_eth(string _message, uint eth_uint);
	event LOG_uint_time(string _message, uint time_uint);
	event LOG_int(string _message, int _int);
	event LOG_address(string _message, address _address);
	event LOG_bytes32(string _message, bytes32 hex_bytes32);
	event LOG_bytes(string _message, bytes hex_bytes);
	event LOG_bytes32_str(string _message, bytes32 str_bytes32);
	event LOG_string(string _message, string _string);
	event LOG_bool(string _message, bool _bool);
// #endif

	event LOG_PolicyApplied(
		uint _policyId,
		address _customer,
		bytes32 str_carrierFlightNumber,
		uint eth_premium
	);
	event LOG_PolicyAccepted(
		uint _policyId,
		uint _statistics0,
		uint _statistics1,
		uint _statistics2,
		uint _statistics3,
		uint _statistics4,
		uint _statistics5
	);
	event LOG_PolicyPaidOut(
		uint _policyId,
		uint eth_amount
	);
	event LOG_PolicyExpired(
		uint _policyId
	);
	event LOG_PolicyDeclined(
		uint _policyId,
		bytes32 str_reason
	);
	event LOG_PolicyManualPayout(
		uint _policyId,
		bytes32 str_reason
	);
	event LOG_SendFunds(
		address _recipient,
		uint8 _from,
		uint eth_amount
	);
	event LOG_ReceiveFunds(
		address _sender,
		uint8 _to,
		uint eth_amount
	);
	event LOG_SendFail(
		uint _policyId,
		bytes32 str_reason
	);
	event LOG_OraclizeCall(
		uint _policyId,
		bytes32 hex_queryId,
		string _oraclize_url
	);
	event LOG_OraclizeCallback(
		uint _policyId,
		bytes32 hex_queryId,
		string _result,
		bytes hex_proof
	);
	event LOG_SetState(
		uint _policyId,
		uint8 _policyState,
		uint time_stateTime,
		bytes32 _stateMessage
	);


	// some general constants for the system:
	// minimum observations for valid prediction
	uint constant minObservations 			= 10;
	// minimum premium to cover costs
	uint constant minPremium 				= 500 finney;
	// maximum premium
	uint constant maxPremium 				= 5 ether;
	// maximum payout
	uint constant maxPayout 				= 150 ether;
	// maximum cumulated weighted premium per risk
	uint maxCumulatedWeightedPremium		= 300 ether;
	// 1 percent for DAO, 1 percent for maintainer
	uint8 constant rewardPercent 			= 2;
	// reserve for tail risks
	uint8 constant reservePercent 			= 1;
	// the weight pattern; in future versions this may become part of the policy struct.
	// currently can't be constant because of compiler restrictions
	// weightPattern[0] is not used, just to be consistent
	uint8[6] weightPattern 					= [0, 10,20,30,50,50];

// #ifndef testrpc
	// DEFINITIONS FOR ROPSTEN AND MAINNET
	// minimum time before departure for applying
	uint minTimeBeforeDeparture				= 24 hours; // for production
	// check for delay after .. minutes after scheduled arrival
	uint checkPayoutOffset					= 15 minutes; // for production
// #endif

// #ifdef testrpc
	// DEFINITIONS FOR LOCAL TESTNET
	// minimum time before departure for applying
	uint minTimeBeforeDeparture				= 1 seconds; // for testing
	// check for delay after .. minutes after scheduled arrival
	uint checkPayoutOffset					= 1 seconds; // for testing
// #endif

	// maximum duration of flight
	uint maxFlightDuration					= 2 days;
	// Deadline for acceptance of policies: 31.12.2030 (Testnet)
	uint contractDeadline 					= 1922396399;

	// gas Constants for oraclize
	uint constant oraclizeGas 				= 500000;



	// URLs and query strings for oraclize

// #ifndef testrpc
	// DEFINITIONS FOR ROPSTEN AND MAINNET
	string constant oraclize_RatingsBaseUrl =
		// ratings api is v1, see https://developer.flightstats.com/api-docs/ratings/v1
		"[URL] json(https://api.flightstats.com/flex/ratings/rest/v1/json/flight/";
	string constant oraclizeRatingsQuery =
		"?${[decrypt] @@include('./external/encryptedQuery/encryptedQueryString.txt')}).ratings[0]['observations','late15','late30','late45','cancelled','diverted']";

	string constant oraclize_StatusBaseUrl =
		// flight status api is v2, see https://developer.flightstats.com/api-docs/flightstatus/v2/flight
	  	"[URL] json(https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/";
	string constant oraclizeStatusQuery =
		// pattern:
		"?${[decrypt] @@include('./external/encryptedQuery/encryptedQueryString.txt')}&utc=true).flightStatuses[0]['status','delays','operationalTimes']";
// #endif

// #ifdef testrpc
	// DEFINITIONS FOR LOCAL TESTNET
	string constant oraclize_RatingsBaseUrl =
		// ratings api is v1, see https://developer.flightstats.com/api-docs/ratings/v1
		"[URL] json(https://api-test.etherisc.com/flex/ratings/rest/v1/json/flight/";
	string constant oraclizeRatingsQuery =
		// for testrpc:
		").ratings[0]['observations','late15','late30','late45','cancelled','diverted']";

	string constant oraclize_StatusBaseUrl =
		// flight status api is v2, see https://developer.flightstats.com/api-docs/flightstatus/v2/flight
		"[URL] json(https://api-test.etherisc.com/flex/flightstatus/rest/v2/json/flight/status/";
	string constant oraclizeStatusQuery =
		// for testrpc:
		"?utc=true).flightStatuses[0]['status','delays','operationalTimes']";
// #endif




}
