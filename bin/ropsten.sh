#!/bin/bash

CHAIN=ropsten
KEYS_PATH=`pwd`/env/keys/
PASSWORD=`pwd`/env/keys/ropsten.txt

parity \
--author 0x19707FA3BBBaaB91a35c838B69a041eb823AC465 \
--unlock 0x19707FA3BBBaaB91a35c838B69a041eb823AC465,\
0x5186aF3a9728DA85B60d4d2Bf325cF6c6FdF3410,\
0x5A8e2e9e253E9ea8D329e9f9230799Fd4a4Fe687,\
0x6fcc2bA0c8D4C785a033D8388EdcBfEe3222a38B,\
0x7EA6CaE3B0badD43A2Ce56eE59E0f596F82AbE31,\
0xABA9Af9d055211530F8b7A9950Feb70FF9E9B7c2,\
0xbB4dB85946b3C45ccC658E7C6Adb4ae6B8B981d7,\
0xCa8833b60A78A28e6d28403Dd3B20C20770f6A3C,\
0xdbf0d8b90f1abffde270baad45bd0e56bc768d87 \
--password=$PASSWORD \
--keys-path=$KEYS_PATH \
--mode active \
--force-ui \
--geth \
--ui-interface 0.0.0.0 \
--jsonrpc-interface '0.0.0.0' --jsonrpc-hosts all \
--unsafe-expose \
--chain ropsten
