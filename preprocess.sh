#!/bin/bash
#
#	Generate new encrypted key and preprocess contracts.
#
#
#
#
echo "Preprocessing Contracts for" $1 "..."
if [ $1 == "testrpc" ]
    then
        testing='--testing'
        debug='--debug'
fi

echo "Network:" $1
if [ $1 != "testrpc" ]
    then
        ./external/encryptedQuery/createEncryptedQuery.sh
fi
touch ./external/encryptedQuery/encryptedQueryString.txt
./util/preprocessor.js --$1 --source contracts-templates --destination contracts $testing $debug
