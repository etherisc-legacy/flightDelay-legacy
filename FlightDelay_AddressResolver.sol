/*
  Copyright (c) 2015-2016 Oraclize SRL
  Copyright (c) 2016 Oraclize LTD
*/

pragma solidity ^0.4.8;


contract FlightDelayAddressResolver {

    address public addr;

    address owner;

    function FlightDelayAddressResolver() {
        owner = msg.sender;
    }

    function changeOwner(address _owner) {
        if (msg.sender != owner) {
            throw;
        }
        owner = _owner;
    }

    function getAddress() constant returns (address _addr) {
        return addr;
    }

    function setAddr(address _addr) {
        if (msg.sender != owner) {
            throw;
        }
        addr = _addr;
    }
}
