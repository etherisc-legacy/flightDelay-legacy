#!/bin/bash

# FlightStats credentials
APP_ID=$APP_ID
APP_KEY=$APP_KEY

# Oraclize Public Key
ORACLIZE_PUBLICKEY=044992e9473b7d90ca54d2886c7addd14a61109af202f1c95e218b0c99eb060c7134c4ae46345d0383ac996185762f04997d6fd6c393c86e4325c469741e64eca9

# Output to:
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# echo $DIR

OUTPUT=$DIR/encryptedQueryString.txt
ALL_ENC=$DIR/allEncryptedQueryStrings.txt

# echo "python $DIR/../encrypted-queries/tools/encrypted_queries_tools.py -e -p ${ORACLIZE_PUBLICKEY} \"appId=${APP_ID}&appKey=${APP_KEY}\" > ${OUTPUT}"
python $DIR/../encrypted-queries/tools/encrypted_queries_tools.py -e -p ${ORACLIZE_PUBLICKEY} "appId=${APP_ID}&appKey=${APP_KEY}" > ${OUTPUT}
echo `date +%Y-%m-%d\ %H:%M:%S` ' : ' `cat ${OUTPUT}` >> ${ALL_ENC}
cat ${OUTPUT}
perl -pi -e 'chomp if eof' ${OUTPUT}
