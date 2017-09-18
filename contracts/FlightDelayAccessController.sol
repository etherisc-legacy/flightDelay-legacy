/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Access controller
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

pragma solidity 0.4.15;

import "./FlightDelayControlledContract.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayConstants.sol";


contract FlightDelayAccessController is FlightDelayControlledContract, FlightDelayConstants {

    FlightDelayDatabaseInterface FD_DB;

    function FlightDelayAccessController(address _controller) {
        setController(_controller);
    }

    function setContracts() onlyController {
        FD_DB = FlightDelayDatabaseInterface(getContract("FD.Database"));
    }

    function setPermissionById(uint8 _perm, bytes32 _id) {
        FD_DB.setAccessControl(msg.sender, _id, _perm);
    }

    function setPermissionById(uint8 _perm, bytes32 _id, bool _access) {
        FD_DB.setAccessControl(
            msg.sender,
            _id,
            _perm,
            _access
        );
    }

    function setPermissionByAddress(uint8 _perm, address _addr) {
        FD_DB.setAccessControl(msg.sender, FD_CI.getContractReverse(_addr), _perm);
    }

    function setPermissionByAddress(uint8 _perm, address _addr, bool _access) {
// --> debug-mode
//            LogUint('setPermissionByAddress _perm', _perm);
//            LogAddress('setPermissionByAddress _addr', _addr);
//            LogBool('setPermissionByAddress _access', _access);
// <-- debug-mode
        FD_DB.setAccessControl(
            msg.sender,
            FD_CI.getContractReverse(_addr),
            _perm,
            _access
        );
    }

    function checkPermission(uint8 _perm, address _addr) returns (bool _success) {
// --> debug-mode
//             LogUint("_perm", _perm);
//             LogAddress("_addr", _addr);
//             LogAddress("msg.sender", msg.sender);
//             LogBool("getAccessControl", FD_DB.getAccessControl(msg.sender, FD_CI.getContractReverse(_addr), _perm));
// <-- debug-mode
        _success = FD_DB.getAccessControl(msg.sender, FD_CI.getContractReverse(_addr), _perm);
    }
}
