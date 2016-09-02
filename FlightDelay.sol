import "./github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "./github.com/Arachnid/solidity-stringutils/strings.sol";

contract FlightDelayIntegrated is usingOraclize {
	
	using strings for *;

	modifier noEther { if (msg.value > 0) throw; _ }
	modifier onlyOwner { if (msg.sender != owner) throw; _ }
	modifier onlyOracle { if (msg.sender != oracle) throw; _ }
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

	event LOG_PolicyApplied(
		uint policyId, 
		address customer, 
		string carrier,
		string flightNumber,
		uint premium
	);
	event LOG_PolicyAccepted(
		uint policyId, 
		uint[5] pattern
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
		uint policyId
	);
	event LOG_SendFail(
		uint policyId
	);
	event LOG_GetFlightStats(
		uint policyId, 
		bytes32 queryId,
		string oraclize_url
	);
	event LOG_OraclizeCallback(
		bytes32 myid, 
		string result
	);
	
	// minimum observations for valid prediction
	uint constant minObservations = 10;
	// minimum premium to cover costs
	uint constant minPremium = 20 finney;
	// maximum premium
	uint constant maxPremium =  5 ether;
	// maximum payout
	uint constant maxPayout = 500 ether;
	// 1 percent for DAO, 1 percent for maintainer
	uint8 constant rewardPercent = 2;			  	
	// reserve for tail risks
	uint8 constant reservePercent = 1;	
	// sum of all Premiums of all currently active policies	
	uint8 constant acc_Premium = 0;			
	// Risk fund; serves as reserve for tail risks
	uint8 constant acc_RiskFund = 1;
	// sum of all payed out policies	
	uint8 constant acc_Payout = 2;
	// the balance of the contract (negative!!)	
	uint8 constant acc_Balance = 3;	      
	// the reward account for DAO and maintainer  
	uint8 constant acc_Reward = 4; 		    
	// oracle costs
	uint8 constant acc_OracleCosts = 5; 		    
	// when adding more accounts, remember to increase ledger array length
	string constant oraclizeCredentialsAndQuery = 
	  "?${[decrypt] @@include('encryptedQueryString.txt')}).ratings[0]['observations','late15','late30','late45','cancelled','diverted']";
	string constant oraclize_baseUrl = 
	  "[URL] json(https://api.flightstats.com/flex/ratings/rest/v1/json/flight/";
	struct policy {

		// the state of the policy
		policyState state;
		// the customer
		address customer;
		// Airline Code
		string carrier;
		// Flight Number
		string flightNumber;
		// departure time
		uint departureTime;
		// scheduled arrival time
		uint arrivalTime;
		// premium
		uint premium;
		// custom payout pattern
		uint8[5] pattern;
		// the determined delay
		uint8 delay;
		// probability weight
		uint weight;
		// calculated Payout
		uint calculatedPayout;
		// actual Payout
		uint actualPayout;
		// time of last state change
		uint stateTime;
		// state change message/reason
		bytes32 stateMessage;

	}
	
	address public owner;
	address public oracle;

	// Table of policies
	policy[] public policies;
	mapping (address => uint[]) public customerPolicies;
	// Lookup policy Ids from queryIds
	mapping (bytes32 => uint) public oraclizeQueryIds;
	// Internal ledger
	int[6] public ledger;
	
	// invariant: acc_Premium + acc_RiskFund + acc_Payout 
	//						+ acc_Balance + acc_Reward == 0
	
	// Mutex
	bool public reentrantGuard;
	
	function setOracle(address _oracle) onlyOwner {

		oracle = _oracle;

	}
	
	function payReward() onlyOwner {
		
		// TODO: payout reward for investors and maintainer
		if (!owner.send(this.balance)) throw;

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

	function getCustomerPolicyId(address _customer, uint _pos) 
		constant returns (uint _policyId) {
		return customerPolicies[_customer][_pos];
	}
	
	function getCustomerPolicy(address _customer, uint _pos) 
		constant 
		returns (
			bool success,
			uint8 state, 
			address customer, 
			string carrier, 
			string flightNumber 
		) {
		policy memory p;
		success = false;
		if (customerPolicies[_customer].length >= _pos) {
			p = policies[customerPolicies[_customer][_pos]];	
			success = true;
		}
		
		state = uint8(p.state);
		customer = p.customer;
		carrier = p.carrier;
		flightNumber = p.flightNumber;
		
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
	function FlightDelayIntegrated (address _oracle) {
		
		owner = msg.sender;    
		oracle = _oracle; // used for payout oracle
		reentrantGuard = false;
		// initially put all funds in risk fund.
		bookkeeping(acc_Balance, acc_RiskFund, msg.value); 
		oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
		
	}

	// create new policy
	function newPolicy(string _carrier, string _flightNumber) {
                uint8[5] memory _pattern = [10,20,30,50,50];
		// sanity checks    

		// don't accept to low or to high policies
		if (msg.value < minPremium || msg.value > maxPremium) {
			throw;
		}

		// store or update policy
		uint policyId = policies.length++;
		customerPolicies[msg.sender].push(policyId);
		policy p = policies[policyId];
		
		p.customer = msg.sender;
		p.carrier = _carrier;
		p.flightNumber = _flightNumber;
		p.premium = bookAndCalcRemainingPremium(); 
		// the remaining premium after deducting reserve and reward
		
		for (uint8 i = 0; i < 5; i++ ) {
			p.pattern[i] = _pattern[i];
		}

		// now we have successfully applied
		p.state = policyState.Applied;
		p.stateMessage = 'Policy applied by customer';
		p.stateTime = now;
		LOG_PolicyApplied(policyId, msg.sender, _carrier, _flightNumber, p.premium);
		
		// call oraclize to get Flight Stats; this will also call underwrite()
		getFlightStats(policyId, _carrier, _flightNumber); 
	}
	

	function revokePolicy(uint _policyId) 
		noEther 
		onlyCustomer(_policyId) 
		noReentrant {
		
		policy p = policies[_policyId];
		if (p.state == policyState.Applied || 
			p.state == policyState.Accepted) { 

			p.state = policyState.Revoked;
			p.stateMessage = 'Policy revoked by customer';
			p.stateTime = now; // won't be reverted in case of errors
			bookkeeping(acc_Premium, acc_Balance, p.premium);
			
			if (!p.customer.send(p.premium)) {
				p.state = policyState.SendFailed;
				bookkeeping(acc_Balance, acc_RiskFund, p.premium);
				p.stateMessage = 'Send failed.';
				LOG_SendFail(_policyId);
			} else { // tell the world
				LOG_PolicyRevoked(_policyId);
			}
		}

	}

	function underwrite(uint _policyId, uint[5] _probabilities) 
		noEther 
	//	onlyOracle 
		onlyInState(_policyId, policyState.Applied) {

		policy p = policies[_policyId]; // throws if _policyId invalid
		for (uint8 i = 0; i < 5; i++ ) {
			p.weight += p.pattern[i] * _probabilities[i]; 
			// 1% = 100 / 100% = 10,000
		}
		p.state = policyState.Accepted;
		p.stateMessage = 'Policy underwritten by oracle';
		p.stateTime = now;

		LOG_PolicyAccepted(_policyId, _probabilities);

	}

	function decline(uint _policyId, bytes32 _reason) 
		noEther 
	//	onlyOracle 
		onlyInState(_policyId, policyState.Applied)  
		noReentrant {

		policy p = policies[_policyId]; 
		
		p.state = policyState.Declined;
		p.stateMessage = _reason;
		p.stateTime = now; // won't be reverted in case of errors
		bookkeeping(acc_Premium, acc_Balance, p.premium);

		if (!p.customer.send(p.premium))  {
			bookkeeping(acc_Balance, acc_RiskFund, p.premium);
			p.state = policyState.SendFailed;
			LOG_SendFail(_policyId);
		}
		else {
			LOG_PolicyDeclined(_policyId);
		}

	}

	function payOut(uint _policyId, uint8 _delay) 
		noEther
		onlyOracle
		onlyInState(_policyId, policyState.Accepted) 
		noReentrant {
		
		policy p = policies[_policyId];
		p.delay = _delay; 					// document delay
			
		if (_delay == 0) {
			p.state = policyState.Expired;
			p.stateMessage = 'Expired - no delay!';
			p.stateTime = now;
			LOG_PolicyExpired(_policyId);
		} else {
			
			uint payout = p.premium * p.pattern[_delay-1] * 10000 / p.weight;
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
				LOG_SendFail(_policyId);
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
		

	function getFlightStats(
		uint _policyId, 
		string _carrier, 
		string _flightNumber) 
		internal {
				
		// call oraclize and retrieve the number of observations from flightstats API
		// format https://api.flightstats.com/flex/ratings/rest/v1/json/flight/OS/75?appId=**&appKey=**
		
		// using nested data sources (query type nested) and partial 
		// encrypted queries in the next release of oraclize
		// note that the first call maps the encrypted string to the 
		// sending contract address, this string can't be used from any other sender
		string memory oraclize_url = strConcat(
			oraclize_baseUrl, 
			_carrier, 
			"/", 
			_flightNumber, 
			oraclizeCredentialsAndQuery
			);
			
		bytes32 queryId = oraclize_query("nested", oraclize_url, 2500000); 
		oraclizeQueryIds[queryId] = _policyId;
					
		LOG_GetFlightStats(_policyId, queryId, oraclize_url);
				
	}

	//function __callback(bytes32 myid, string result, bytes proof) {
	function __callback(bytes32 _queryId, string _result, bytes proof) onlyOraclize {
	
		// LOG_callback(myid, result, proof);
		LOG_OraclizeCallback(_queryId, _result);

		// we expect result to contain 6 values, something like 
		// "[61, 10, 4, 3, 0, 0]" -> 
		// ['observations','late15','late30','late45','cancelled','diverted']

	
		uint policyId = oraclizeQueryIds[_queryId];

		if (bytes(_result).length == 0) {
			decline(policyId, 'Declined (empty result)');
		} else {
		// now slice the string using 
		// https://github.com/Arachnid/solidity-stringutils
			
			var q = _result.toSlice();
			var delim = ", ".toSlice();

			if (q.count(delim) != 5) { // check if result contains 6 values
				decline(policyId, 'Declined (invalid result)');
			} else {
				q.beyond("[".toSlice()).until("]".toSlice());
			
				uint observations = parseInt(q.split(delim).toString());
		
				// decline on < minObservations observations, 
				// can't calculate reasonable probabibilities
				if (observations <= minObservations) {
					decline(policyId, 'Declined (too few observations)');
				} else {
					uint[5] memory probabilities;
					// calculate probabilities (scaled by 100)
					for(uint i = 0; i < 5; i++) {
						probabilities[i] = 
							parseInt(q.split(delim).toString()) * 10000/observations;
					}
								
					// underwrite policy
					underwrite(policyId, probabilities);
				}
			}
		}
	}
}
