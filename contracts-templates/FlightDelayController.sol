/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Controller contract
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./Owned.sol";
import "./FlightDelayControlledContract.sol";

contract FlightDelayController is

  Owned

{

  mapping (bytes32 => address) public contracts;
  bytes32[] public contractIds;

  /**
   * Only Owner.
   */
  modifier onlyOwner {
    if (msg.sender != owner) {
      throw;
    }
    _;
  }

  /**
   * Constructor.
   */
  function FlightDelayController() {
    owner = msg.sender;
  }

  /**
   * Store address of one contract in mapping.
   * @param _addr       Address of contract
   * @param _id         ID of contract
   */
  function setContract(address _addr, bytes32 _id) internal {
    contracts[_id] = _addr;
  }

  /**
   * Get contract address from ID. This function is called by the
   * contract's setContracts function.
   * @param _id         ID of contract
   * @return The address of the contract.
   */
  function getContract(bytes32 _id) returns (address) {
    return contracts[_id];
  }

  /**
   * Registration of contracts.
   * It will only accept calls of deployments initiated by the owner.
   * @param _id ID of contract
   * @return  bool success
   */
  function registerContract(address _addr, bytes32 _id) onlyOwner returns (bool result) {
    setContract(_addr, _id);
    contractIds.push(_id);
    return true;
  }

  /**
   * Deregister a contract.
   * In future, contracts should be exchangeable.
   * @param _id         ID of contract
   * @return  bool        success
   */
  function deregister(bytes32 _id) onlyOwner returns (bool result) {
    if (getContract(_id) == 0x0){
      return false;
    }
    setContract(0x0, _id);
    return true;
  }

  /**
   * After deploying all contracts, this function is called and calls
   * setContracts() for every registered contract.
   * This call pulls the addresses of the needed contracts in the respective contract.
   * We assume that contractIds.length is small, so this won't run out of gas.
   */
  function setAllContracts() onlyOwner {
    uint i;
    FlightDelayControlledContract FD_CC;
    // TODO: Check for upper bound for i
    // i = 0 is FD.Owner, we skip this.
    for (i = 1; i < contractIds.length; i++) {
      FD_CC = FlightDelayControlledContract(contracts[contractIds[i]]);
      FD_CC.setContracts();
    }
  }

  function setOneContract(uint i) onlyOwner {
    FlightDelayControlledContract FD_CC;
    // TODO: Check for upper bound for i
    FD_CC = FlightDelayControlledContract(contracts[contractIds[i]]);
    FD_CC.setContracts();
  }

  /**
   * Destruct one contract.
   * @param _id         ID of contract to destroy.
   */
  function destruct_one(bytes32 _id) onlyOwner {
    address addr = getContract(_id);
    if (addr != 0x0) {
      FlightDelayControlledContract(addr).destruct();
    }
  }

  /**
   * Destruct all contracts.
   * We assume that contractIds.length is small, so this won't run out of gas.
   * Otherwise, you can still destroy one contract after the other with destruct_one.
   */
  function destruct_all() onlyOwner {
    uint i;
    // TODO: Check for upper bound for i
    for (i = 1; i < contractIds.length; i++) {
        destruct_one(contractIds[i]);
    }

    selfdestruct(owner);
  }
}
