/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	AccessControllerInterface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 *
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');


contract FlightDelayAccessControllerInterface {

	function setPermissionById(uint8 _perm, bytes32 _id);
	function setPermissionById(uint8 _perm, bytes32 _id, bool _access);
	function setPermissionByAddress(uint8 _perm, address _addr);
	function setPermissionByAddress(uint8 _perm, address _addr, bool _access);
	function checkPermission(uint8 _perm, address _addr) returns (bool _success);

}


