#!/bin/bash
#
#

pushd test
rm *

function enable {
	ln -s ../test-available/$1 $1
}

enable logformatter.js

# enable Test_FlightDelayController.js
# enable Test_FlightDelayDestruct.js
enable Test_FlightDelayNewPolicy.js

# enable Test_FlightDelayDatabase.js
# enable Test_FlightDelayLedger.js



#enable Test_FlightDelayUnderwrite.js
#enable Test_FlightDelayOraclize.js
#enable Test_FlightDelayDatabase.sol
#enable Test_FlightDelayNewPolicy.sol

#enable Test_Oraclize.js
#enable test_flightdelay.tpl

ls -alF
popd
