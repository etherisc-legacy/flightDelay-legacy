/**
 * FlightDelay with Oraclized Underwriting and Payout
 *
 * @description	Conversions
 * @copyright (c) 2017 etherisc GmbH
 * @author Christoph Mussenbrock
 */

pragma solidity ^0.4.11;


contract ConvertLib {

    // .. since beginning of the year
    uint16[12] days_since = [
        11,
        42,
        70,
        101,
        131,
        162,
        192,
        223,
        254,
        284,
        315,
        345
    ];

    function b32toString(bytes32 x) internal returns (string) {
        // gas usage: about 1K gas per char.
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;

        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }

        bytes memory bytesStringTrimmed = new bytes(charCount);

        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }

        return string(bytesStringTrimmed);
    }

    function b32toHexString(bytes32 x) returns (string) {
        bytes memory b = new bytes(64);
        for (uint i = 0; i < 32; i++) {
            uint8 by = uint8(uint(x) / (2**(8*(31 - i))));
            uint8 high = by/16;
            uint8 low = by - 16*high;
            if (high > 9) {
                high += 39;
            }
            if (low > 9) {
                low += 39;
            }
            b[2*i] = byte(high+48);
            b[2*i+1] = byte(low+48);
        }

        return string(b);
    }

    function parseInt(string _a) internal returns (uint) {
        return parseInt(_a, 0);
    }

    // parseInt(parseFloat*10^_b)
    function parseInt(string _a, uint _b) internal returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i = 0; i<bresult.length; i++) {
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)) {
                if (decimals) {
                    if (_b == 0) {
                        break;
                    } else {
                        _b--;
                    }
                }
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) {
                decimals = true;
            }
        }
        if (_b > 0) {
            mint *= 10**_b;
        }
        return mint;
    }

    // the following function yields correct results in the time between 1.3.2016 and 28.02.2020,
    // so within the validity of the contract its correct.
    function toUnixtime(bytes32 _dayMonthYear) constant returns (uint unixtime) {
        // _day_month_year = /dep/2016/09/10
        bytes memory bDmy = bytes(b32toString(_dayMonthYear));
        bytes memory temp2 = bytes(new string(2));
        bytes memory temp4 = bytes(new string(4));

        temp4[0] = bDmy[5];
        temp4[1] = bDmy[6];
        temp4[2] = bDmy[7];
        temp4[3] = bDmy[8];
        uint year = parseInt(string(temp4));

        temp2[0] = bDmy[10];
        temp2[1] = bDmy[11];
        uint month = parseInt(string(temp2));

        temp2[0] = bDmy[13];
        temp2[1] = bDmy[14];
        uint day = parseInt(string(temp2));

        unixtime = ((year - 1970) * 365 + days_since[month-1] + day) * 86400;
    }
}
