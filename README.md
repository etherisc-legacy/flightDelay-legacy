# FlightDelay - the first complete decentralized Flight Delay compensation on the Ethereum Blockchain


## The project

This is the home of the FlightDelay Contract.
The contract manages the operation of an insurance-like business process, allowing users to apply for policies, and an oracle for underwriting and payout in case of claims.

The usecase is the compensation of flight delays. Users can select any flight and apply for compensation in case the flight is late.
They pay a fair premium and automagically get a compensation as soon as the plane has landed (except in the case of a punctal arrival, of course nothing is paid then). 

## The contract

The contract has been kept as simple as possible, to make it as safe as possible. Additional safeguards have been taken to prevent reentrant attacks, for example a mutex/reentrant guard has been implemented, even though we believe it is not really necessary - all send functions are checked and should not yield any attack vectors.

Additional, an internal ledger keeps track of all value transfers. Its very easy to check if the contract has been manipulated.

The contract is verified on etherscan: http://testnet.etherscan.io/address/0x19F796C98764d7169fD3447817fCF23298cE6397#code

## Use of oraclize

The contract makes heavy use of oraclize (Thank you Thomas for your support!). We have two different calls, one for underwriting (what is the probability that a flight is late?), and a second one for payout (When did a particular flight land, how much delay did it have and which amount is to be paid out to the customer?). 
The second call is scheduled at underwriting and is rescheduled if the plane hasn't arrived in time.

## The frontend

A frontend for interaction with the contract has been deployed under https://fdi.etherisc.com. Its a standalone meteor dapp which can interact with the blockchain via the MetaMask.io browser extension or the Mist Browser.

## Go Live on 06.09.2016

The contract will be provided with sufficient funding on 06.09.2016, so that everybody travelling to DevCon2 has a chance to get compensated on flight delays! We have enough funds to cover all payouts, but for safety reasons, we will feed these funds only as far as necessary in the contract. The live period will end about four weeks later and the contract will be closed then. In case a surplus has been accumulated, this surplus will be donated to the Ethereum Foundation. The remaining capital will be distributed amongst the inital investors. 

## Disclaimer

This is an experiment and a showcase for devcon two, and by no means a commercial offering. Use at your own risk and never send Ether to a DApp you don't understand. Probabilities and payouts are calculated from data from flightstats and using oraclize.
