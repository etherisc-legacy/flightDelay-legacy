/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Ocaclize API interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity ^0.4.11;

import "./../vendors/usingOraclize.sol";


contract FlightDelayOraclizeInterface is usingOraclize {

    modifier onlyOraclizeOr (address _emergency) {
// --> prod-mode
        require(msg.sender == oraclize_cbAddress() || msg.sender == _emergency);
// <-- prod-mode
        _;
    }
}
