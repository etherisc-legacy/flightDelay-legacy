/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description Contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

contract FlightDelayControllerInterface {

  function selfRegister(bytes32 _id) returns (bool result) {}

  function getContract(bytes32 _id) returns (address _addr) {}
}
