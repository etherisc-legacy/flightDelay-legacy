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
        if (msg.sender != oraclize_cbAddress()) {
            throw;
        }
        _;
    }

    function FlightDelayOraclizeInterface () {
        // #ifdef testing
        // oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
        // for ethereum-bridge, discard after testing
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        // #endif
    }
}
