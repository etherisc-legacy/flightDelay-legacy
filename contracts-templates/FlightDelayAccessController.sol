/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Access controller
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./FlightDelayControlledContract.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayConstants.sol";

contract FlightDelayAccessController is
	FlightDelayControlledContract,
	FlightDelayConstants {

	FlightDelayDatabaseInterface FD_DB;

	function FlightDelayAccessController(address _controller) {
		setController(_controller, 'FD.AccessController');
	}

	function setContracts() onlyController {
		FD_DB = FlightDelayDatabaseInterface(getContract('FD.Database'));
	}

	function setPermissionById(uint8 _perm, bytes32 _id) {
		FD_DB.setAccessControl(msg.sender, FD_CI.getContract(_id), _perm);
	}

	function setPermissionById(uint8 _perm, bytes32 _id, bool _access) {
		FD_DB.setAccessControl(msg.sender, FD_CI.getContract(_id), _perm, _access);
	}

	function setPermissionByAddress(uint8 _perm, address _addr) {
		FD_DB.setAccessControl(msg.sender, _addr, _perm);
	}

	function setPermissionByAddress(uint8 _perm, address _addr, bool _access) {
		FD_DB.setAccessControl(msg.sender, _addr, _perm, _access);
	}

	function checkPermission(uint8 _perm, address _addr) returns (bool _success) {
    // #ifdef debug
		LOG_uint('_perm', _perm);
		LOG_address('_addr', _addr);
		LOG_address('msg.sender', msg.sender);
		LOG_bool('getAccessControl', FD_DB.getAccessControl(msg.sender, _addr, _perm));
    // #endif

		return FD_DB.getAccessControl(msg.sender, _addr, _perm);
	}
}
