/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Controlled contract Interface.
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayControllerInterface.sol";
import "./FlightDelayDatabaseModel.sol";

contract FlightDelayControlledContract is FlightDelayDatabaseModel {

	address public controller;
  FlightDelayControllerInterface FD_CI;

  modifier onlyController() {
    if (msg.sender != controller) {
      throw;
    }
    _;
  }

	function setController(address _controller, bytes32 _id) internal returns (bool _result){
    if(controller != 0x0 && msg.sender != controller){
        // selfdestruct(controller);
    }
    controller = _controller;
    FD_CI = FlightDelayControllerInterface(_controller);
    FD_CI.selfRegister(_id);
    return true;
  }

  function destruct() onlyController {
    selfdestruct(controller);
  }

  function setContracts() onlyController {}

  function getContract(bytes32 _id) internal returns (address _addr) {
    _addr = FD_CI.getContract(_id);
  }

}


