/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Access controller
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

pragma solidity ^0.4.11;

import "./FlightDelayControlledContract.sol";
import "./FlightDelayDatabaseInterface.sol";
import "./FlightDelayConstants.sol";


contract FlightDelayAccessController is FlightDelayControlledContract, FlightDelayConstants {

    FlightDelayDatabaseInterface FD_DB;

    modifier onlyEmergency() {
        require(msg.sender == FD_CI.getContract('FD.Emergency'));
        _;
    }

    function FlightDelayAccessController(address _controller) {
        setController(_controller);
    }

    function setContracts() onlyController {
        FD_DB = FlightDelayDatabaseInterface(getContract("FD.Database"));
    }

    function setPermissionById(uint8 _perm, bytes32 _id) {
        FD_DB.setAccessControl(msg.sender, FD_CI.getContract(_id), _perm);
    }

    function fixPermission(address _target, address _accessor, uint8 _perm, bool _access) onlyEmergency {
        FD_DB.setAccessControl(
            _target,
            _accessor,
            _perm,
            _access
        );

    }

    function setPermissionById(uint8 _perm, bytes32 _id, bool _access) {
        FD_DB.setAccessControl(
            msg.sender,
            FD_CI.getContract(_id),
            _perm,
            _access
        );
    }

    function setPermissionByAddress(uint8 _perm, address _addr) {
        FD_DB.setAccessControl(msg.sender, _addr, _perm);
    }

    function setPermissionByAddress(uint8 _perm, address _addr, bool _access) {
        FD_DB.setAccessControl(
            msg.sender,
            _addr,
            _perm,
            _access
        );
    }

    function checkPermission(uint8 _perm, address _addr) returns (bool _success) {
// --> debug-mode
//            // LogUint("_perm", _perm);
//            // LogAddress("_addr", _addr);
//            // LogAddress("msg.sender", msg.sender);
//            // LogBool("getAccessControl", FD_DB.getAccessControl(msg.sender, _addr, _perm));
// <-- debug-mode
        _success = FD_DB.getAccessControl(msg.sender, _addr, _perm);
    }
}
