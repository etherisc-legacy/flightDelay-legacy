#!/bin/bash
#
#	Generate new encrypted key and preprocess contracts.
#
#
#
#
PS3='Please enter your choice: '
options=("Local testnet" "Ropsten" "Mainnet" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Local testnet")
            echo "Preprocessing Contracts for local testnet ..."
            network='default'
	    testing='--testing'
            break
            ;;
        "Ropsten")
            echo "Preprocessing Contracts for Ropsten ..."
            network='ropsten'
            break
            ;;
        "Mainnet")
            echo "Preprocessing Contracts for Mainnet ..."
            network='mainnet'
            break
            ;;
        "Quit")
            exit 0
            ;;
        *) echo invalid option;;
    esac
done

echo $network
if [ $network != "default" ]
    then
        ./external/encryptedQuery/createEncryptedQuery.sh
fi
./util/preprocessor.js --$network --source contracts-templates --destination contracts $testing $2