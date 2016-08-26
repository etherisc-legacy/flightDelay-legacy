# FlightDelay - the first complete decentralized Flight Delay compensation on the Ethereum Blockchain


## The project

This is the home of the FlightDelay Contract.
The contract manages the operation of an insurance-like business process, allowing users to apply for policies, and an oracle for underwriting and payout in case of claims.

The usecase is the compensation of flight delays. Users can select any flight and apply for compensation in case the flight is late.
They pay a fair premium and automagically get a compensation as soon as the plane has landed (except in the case of a punctal arrival, of course nothing is paid then). 

## The contract

The contract has been kept as simple as possible, to make it as safe as possible. Additional safeguards have been taken to prevent reentrant attacks, for example a mutex/reentrant guard has been implemented, even though we believe it is not really necessary - all send functions are checked and should not yield any attack vectors.

Additional, an internal ledger keeps track of all value transfers. Its very easy to check if the contract has been manipulated.

The contract is verified on etherscan: http://testnet.etherscan.io/address/0x19fa86e440828d4e02b3d14041f6dc05ffec4167#code

## The frontend

A frontend for interaction with the contract has been deployed under https://fdi.etherisc.com. Its a standalone meteor dapp which can interact with the blockchain via the MetaMask.io browser extension or the Mist Browser.

## Bug bounty

A bug bounty of 20 ETH is set for any bug which is reported to us till the 05.09.2016 - the date we will go live on mainnet with this prototype. The amount of 20 ETH will be distributed on a fair basis without any legal obligations amongst the reporters. A bug is any weakness in the contract which could lead to a potential loss of money for either a customer or an investor.

## Go Live on 05.09.2016

The contract will be provided with about 2.000 ETH on 05.09.2016, so that everybody travelling to DevCon2 has a chance to get compensated on flight delays! The live period will end four weeks later and the contract will be closed then. In case a surplus has been accumulated, this surplus will be donated to the Ethereum Foundation. The remaining capital will be distributed amongst the inital investors. 

