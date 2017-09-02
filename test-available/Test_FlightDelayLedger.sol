pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

import "../contracts/FlightDelayController.sol";
import "../contracts/FlightDelayLedger.sol";
import "../contracts/FlightDelayAccessController.sol";

contract Test_FlightDelayLedger {
	FlightDelayController FD_CT;
    FlightDelayLedger FD_LG;
    FlightDelayAccessController FD_AC;

    function testInit () {
        FD_CT = FlightDelayController(DeployedAddresses.FlightDelayController());
        FD_LG = FlightDelayLedger(DeployedAddresses.FlightDelayLedger());
        FD_AC = FlightDelayAccessController(DeployedAddresses.FlightDelayAccessController());
    }

    function testControllerShouldBeSet() {
        address controller = FD_LG.controller();
        address SystemController = DeployedAddresses.FlightDelayController();

        Assert.equal(controller, SystemController, "Controller should be set properly");
    }

    function testAccessPermissions() {
        bool permissions = FD_AC.checkPermission(104, address(this));

        Assert.equal(permissions, false, "This contracts shouldn't have 104 permissions");
    }

    function testSetPermissions() {
        FD_AC.setPermissionById(199, "FD.Controller");

        bool permissions = FD_AC.checkPermission(199, DeployedAddresses.FlightDelayController());

        Assert.equal(permissions, true, "This contracts shouldn't have 199 permissions");
    }
}
