/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Ocaclize API interface
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock, Stephan Karpischek
 */

@@include('./templatewarning.txt')

pragma solidity @@include('./solidity_version_string.txt');

import "./../3rd-party/usingOraclize.sol";


contract FlightDelayOraclizeInterface is usingOraclize {

    modifier onlyOraclize () {
        require(msg.sender == oraclize_cbAddress());
        _;
    }
}
