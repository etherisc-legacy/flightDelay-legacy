/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Owned pattern
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

contract Owned {

	address owner;

	modifier onlyOwner() {
		if (owner != msg.sender) {
			throw;
		}
		_;
	}

	/**
	 * set a new owner.
	 * @param _newOwner the new owner
	 */
	function setOwner(address _newOwner) onlyOwner {
		owner = _newOwner;
	}

	/**
	 * Constructor
	 */
	function Owned() {
		owner = msg.sender;
	}
}
