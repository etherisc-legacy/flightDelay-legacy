/*
  Copyright (c) 2015-2016 Oraclize SRL
  Copyright (c) 2016 Oraclize LTD
*/

contract FlightDelay_AddressResolver {

  address public addr;

  address owner;

  function FlightDelay_AddressResolver(){
    owner = msg.sender;
  }

  function changeOwner(address newowner){
    if (msg.sender != owner) throw;
    owner = newowner;
  }

  function getAddress() constant returns (address addr){
    return addr;
  }

  function setAddr(address newaddr){
    if (msg.sender != owner) throw;
    addr = newaddr;
  }

}
