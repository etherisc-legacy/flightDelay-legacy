# Etherisc Security Checklist

## General checklist

### C1. Avoid external calls if possible
Treat every external call as a potential security issue.
If functionality can not be implemented without external calls,
pay attention to the rest of recommendations on external calls.

Related attacks:

* Call stack depth attack
* Reentrancy

### C2. Prioritize state change before making external call
Functions with external calls can be called recursively by other contracts.
If contract does not update its state before the external call,
all invariants will remain the same,
until recursion exits.
Attackers may use this to drain all funds from the contract.

Related attacks attacks:

* Call stack depth attack
* Reentrancy

### C3. Prefer isolation of external calls in a separate transaction
Instead of making external calls,
consider allowing users to perform the call on your contract.
For example, if you have a lottery smart contract,
allow users to withdraw winnings on their own by calling your contract,
instead of sending money automatically.

Related attacks:

* DoS with unexpected throw
* DoS with block gas limit

### C4. `send()` vs `call.value()()` vs `transfer()`
The are multiple ways to send Ether to other accounts or smart contracts.
Beware of the differences between these key functions:
* Both `send()` and `call.value()()` do not throw when recepient rejects the funds
* However, `transfer()` throws if recepient rejects the funds
* `call.value()()`, by default, forwards all remaining gas to the recepient to use
* `send()` and `transfer()` limit the recepient's gas usage with only 2300 gas

As a result, `send()` and `transfer()` are considered safe from reentrancy attacks,
'cause 2300 gas is not enough to make an external call.

Related attacks:

* DoS with unexpected throw
* Call stack depth attack

### C5. Mark untrusted contracts
Mark potentially unsafe external contracts in your codebase.
Every function which interacts with such contracts should be marked as well.
For example, use the following naming convention:
```
function makeUntrustedWithdrawal(uint amount) {}
```

### C6. Avoid making control flow assumptions based on timestamps
Miners can manipulate the time (`now`) during transaction mining,
and exploit the logic of the smart contract.

Related attacks:

* Timestamp dependency attack

### C7. Validate user-supplied data
If users can actively mutate the state of the contract,
make sure they do it in a correct way.

Possible attacks:

* DoS with block gas limit
* Short address attack

### C8. Avoid iterating over dynamically sized arrays
Iterating over large arrays may lead to running beyound gas limit.

Possible attacks:

* DoS with block gas limit

### C9. Avoid integer division
Integer division in Solidity rounds the integer down.
Careless use may lead to unexpected logical errors.

### C10. Avoid zero division
Zero division in Solidity returns zero.
Careless use may lead to unexpected logical errors.

### C11. Beware of integer overflow / underflow
Integer overflow in Solidity leads to variable value being set to zero.
Underflow circles the value to other direction - to a maximum value.
Be cautious with math operations on boundary values of the type.

### C12. Avoid usage of `tx.origin`
`tx.origin` contains the address of originator of the transaction.
Any kind of auth based on `tx.origin` is vulnurable to malicious external contracts.
If originator calls a malicious contract, that contract may use `tx.origin` to
impersonate the originator of the transaction.

### C13. Avoid storing private data in a blockchain
Every miner has access to the data of every smart contract (`private` variables included).

### C14. In N-party contracts, handle the scenario where some of the parties may drop offline and never return
For example, if one of the parties loses credentials, contract funds may become irrecoverable.
It is recommended to have a reasonable workaround to recover from such situations.

### C15. Keep fallback function simple
If your contract is allowed to receiver Ether,
it should implement a fallback function.
This function has access to 2300 gas if it's called from `send` or `transfer`.

### C16. Explicitly state visibility of functions and state variables
Default function visibility is `public`,
which can lead to unexpected sucurity issues.
State variables are `internal` by default.

### C17. Differentiate naming of events and functions
In order to avoid confusion, incorporate different naming conventions for functions
and events. For example:

```
// bad
event Payout() {}
function payout() {}

// good
event LogPayout() {}
function payout() external {}
```

### C18. Avoid strict checks of balance
It is possible to forcibly send Ether to an contract (even if its fallback function throws).
For example, if contract expects its balance to be a specific value,
attacker can change it and affect the logic flow.

### C19. Stictly lock Solidity version in pragma directive
Using different versions of Solidity compilers during development, testing and production deployment
can lead to hard-to-reproduce bugs and different gas usage.
Lock the Solidity version on every contract.

### C20. (TBD) Perform formal verification
The is no direct integration yet,
but the idea is to formally prove correctness of smart contract behaviour
on allowed inputs.

### C21. Avoid incorrect usage of cryptography
Since all data on the blockchain is public,
it's dangerous to store any kind of secrets or encrypted data inside of it.
Even if encryption was used correctly and hasn't been broken at the time of the mining,
information can be obtained later.

### C22. Beware of malicious libraries
For example, libraries may include malicious external calls

### C23. Prefer safeMath for computations
In order to avoid integer overflow / underflow,
use safeMath library:
https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/math/SafeMath.sol

## Known attack types

### A1. Reentrancy
External contracts calls may lead to recursive call of our own contract
Consider the following example:

```
// INSECURE
mapping (address => uint) private userBalances;

function withdrawBalance() public {
    uint amountToWithdraw = userBalances[msg.sender];
    // External contract can call `withdrawBalance()` again
    if (!(msg.sender.call.value(amountToWithdraw)())) { throw; }
    userBalances[msg.sender] = 0;
}
```

If external contract calls `withdrawBalance()` again,
the state will be the same as during the initial call,
which will allow to withdraw funds multiple times.

Possible fix is to perform state update before making external call.

### A2. Cross-function reentrancy
Basically the same reentrancy attack,
but external contract may reenter the contract at a different function.

### A3. DoS with unexpected throw
For example, smart contract has a refund functionality:

```
address[] private refundAddresses;
mapping (address => uint) public refunds;

// bad
function refundAll() public {
    for(uint x; x < refundAddresses.length; x++) { // arbitrary length iteration based on how many addresses participated
        if(refundAddresses[x].send(refunds[refundAddresses[x]])) {
            throw; // doubly bad, now a single failure on send will hold up all funds
        }
    }
}
```

If at least one refund fails,
it will prevent the whole transaction from succeeding.
As a result, no one will receive a refund.

Possible solution might be implementation of push / pull process,
where contract users will be responsible for calling a separate `refund()` function
to withdraw the funds.

### A4. DoS with block gas limit
There is a limit on how much gas contract may consume during the transaction.
Transaction will be reverted, if limit is reached.
It often happens when contracts iterate over large dynamic arrays.
If attacker can manipulate the size of that array,
he can effectively shutdown the contract execution.

### A5. Transaction ordering dependence
If applying two transactions in a different order leads to different results,
contract is considered to depend on the transaction order.
Since its possible to influence the order of transaction execution (by setting higher gas price),
users can affect the logic flow of the contract.


### A6. Timestamp dependence
If logic relies on current timestamp (`now`),
malicious miners can manipulate its value to tip execution of the contract in their favor.

### A7. Integer overflow / underflow attack
For example, if a variable of type `uint256` will reach a maximum value,
it will circle back to zero, which may lead to unexpected behaviour.
The same is true for underflow - if the value is small enough, and we subtract from it,
it will be set to the maximum allowed value for the type.

### A8. Short address attack
Attacker can manipulate the size of the data sent to the smart contract,
thus changing the behaviour in unexpected way.

### A9. Malicious creator
It's more a question of trust,
but if contract's creator can shutdown the contract and withdraw all funds from it,
he or she may effectively steal all Ether provided by contract's users.

### A10. ~~Call stack depth attack~~
Eliminated by EIP 150 (https://github.com/ethereum/EIPs/blob/master/EIPS/eip-150.md)

## Useful links

* https://github.com/ConsenSys/smart-contract-best-practices
* https://www.kingoftheether.com/contract-safety-checklist.html
* http://www.comp.nus.edu.sg/~loiluu/papers/oyente.pdf
* https://blog.golemproject.net/how-to-find-10m-by-just-reading-blockchain-6ae9d39fcd95
