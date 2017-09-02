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

    modifier onlyOraclize () {
        require(msg.sender == oraclize_cbAddress());
        _;
    }
}
