/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Ocaclize API interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

pragma solidity 0.4.15;

import "./../vendors/usingOraclize.sol";


contract FlightDelayOraclizeInterface is usingOraclize {

    modifier onlyOraclize () {
// --> prod-mode
        require(msg.sender == oraclize_cbAddress());
// <-- prod-mode
        _;
    }
}
