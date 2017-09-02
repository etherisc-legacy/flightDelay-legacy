/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Owned pattern
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Owned {

    address public owner;

    /**
     * @dev The Owned constructor sets the original `owner` of the contract to the sender
     * account.
     */
    function Owned() {
        owner = msg.sender;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
}
