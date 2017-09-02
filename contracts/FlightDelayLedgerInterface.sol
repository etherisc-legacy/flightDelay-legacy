/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Ledger contract interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;

import "./FlightDelayDatabaseModel.sol";


contract FlightDelayLedgerInterface is FlightDelayDatabaseModel {

    function receiveFunds(Acc _to) payable;

    function sendFunds(address _recipient, Acc _from, uint _amount) returns (bool _success);

    function bookkeeping(Acc _from, Acc _to, uint amount);
}
