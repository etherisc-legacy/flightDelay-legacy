# FlightDelay - the first decentralized Flight Delay insurance on the Ethereum Blockchain


## The project

This is the home of the FlightDelay Contract.
The contract manages the operation of an insurance-like business process, allowing users to apply for policies, and an oracle for underwriting and payout in case of claims.

The usecase is the insurance of flight delays. Users can select any flight and apply for an insurance policy in case the flight is late.
They pay a fair premium and automagically get a payout as soon as the plane has landed (except in the case of a punctal arrival, of course nothing is paid then). 

## The contracts

The contract has been kept as simple as possible, to make it as safe as possible.
Actually, it's not a single contract, but a suite of seven contracts which interact closely together. We will give a short description of the parts here:

### FlightDelayNewPolicy
This contract acts as the sole entry point for customers. Customers can call the payable function newPolicy(...), which starts
the business process. The process consists of these steps:
1. **Apply for policy:** The input parameters provided by the customer are validated and a first call to our oracle is scheduled.
2. **Underwrite policy:** After the callback from the oracle has arrived, we calculate the risk model for the specific flight and store
the parameters. We then trigger an event to inform the customer, that his policy has been accepted.
At the same time, we schedule another oraclize call for the time of the scheduled landing
3. **Payout**: At the time of scheduled landing, the oracle checks the flight status. If the plane has arrived in time,
the policy expires and no payout is done. If the plane is already arrived, but late, we calculate the payout
and transfer the money. If the plane has not yet landed, we reschedule up to 4 calls to oraclize until the
plane has landed and the delay can be calculated.

### FlightDelayUnderwrite
This contract calls the oracle to get the risk parameters for the flight (the payout is calculated based on 
the historical probabilities of a delay, which we get from the oracle).
After this, the policy is either accepted or declined.
In case the policy is accepted, we schedule an oraclize call for the time of the landing.

### FlightDelayPayout
15 minutes after the scheduled landing, we check the flight status. 
As mentioned, we calculate the payout and transfer the money in case a delay has been detected.

### FlightDelayDatabase
All data is kept in a central contract. In case we need to update a contract, the data can be used
by updated contracts as well.

### FlightDelayLedger
All funds are kept in this contract. This minimizes the attack surface. The Ledger performs the actual payout
if the payout contracts decides so.

### FlightDelayAccessControl
Seven contracts are interacting - this calls for some mechanism that only authorized calls can be made.
We have implemented an Access Control List (ACL) which keeps track which contract may call which function
in other contracts.
The ACL itself is kept in the central database.

### FlightDelayController
All contracts have to know to whom they shall talk. The Controller keeps track on contract addresses,
so we can easily update parts of the contract if necessary.


## Security
Many safeguards have been taken to prevent known attacs. 
Additional, an internal ledger keeps track of all value transfers. 
Its very easy to check if the contract has been manipulated.

The contracts source are verified on Etherscan.

## Use of oraclize

The contracts makes heavy use of oraclize (Thank you Thomas for your support!). 
We have two different calls, one for underwriting (what is the probability that a flight is late?), 
and a second one for payout (When did a particular flight land, how much delay did it have and which amount is to be paid out to the customer?). 
The second call is scheduled at underwriting and is rescheduled up to 4 times if the plane hasn't arrived in time.
If the plane hasn't landed 3 hours after the scheduled arrival time, the contract gives up and we will then process a possible payout
manually.

## The frontend

A frontend for interaction with the contract has been deployed under https://fdd.etherisc.com. 
Its a standalone meteor dapp which can interact with the blockchain via the MetaMask.io browser extension or the Mist Browser.
We have also implemented a fiat gateway, which enables you to buy a policy with fiat currency - either USD, EUR or GBP.

## Go Live

While we had a simpler version of this contract live for DevCon2 last year, we are now fully licensed. 
We currently have a license to sell policies especially for flights to DevCon3 in Cancun, so every participant has a chance to get compensated on flight delays! 
We have enough funds to cover all payouts, but for safety reasons, we will feed these funds in the contract only as far as necessary. 
The live period has started on Wednesday, 26.10.2017 12:00 UTC and last until Sunday, 5.11.2017. 

## Partnership

The commercial offering is brought to you by our partner, Atlas Insurance on Malta, who takes the role
as the official issuer of the insurance policy. 