#!/usr/bin/env node

const TestRPC = require('ethereumjs-testrpc');
const log = require('../util/logger');

const options = {
    port: 9545,
    accounts: [
        // 0 - deployer
        { secretKey: '0xfbdab455fa027cfcc5b847b4541f0d9b3ee9f176bcc2dd60acdbb26c30e00000', balance: 1000000000000000000000000, },
        // 1 - new owner & FD.Owner
        { secretKey: '0xcba39ec99dfca0db448b4bafad7049b7a504c6557a53c65bb4ef0cc219300001', balance: 1000000000000000000000000, },
        // 2 - FD.Funder
        { secretKey: '0x7e2b1d0ae9f7bb8e935ac215ab42e8342bd31830a570cf08c9c2a2a5a4400002', balance: 1000000000000000000000000, },
        // 3 - FD.CustomersAdmin
        { secretKey: '0xee49329dbe74c4d2866a7d0278b3110749fa03e7404021d2d15810c1b8f00003', balance: 1000000000000000000000000, },
        // 4 - FD.Emeregency
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00004', balance: 1000000000000000000000000, },
        // 5 - Customer
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00005', balance: 1000000000000000000000, },
        // 6 - Bridge deployer
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00006', balance: 1000000000000000000000000, },
        // 7 - Test 1
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00007', balance: 1000000000000000000000000, },
        // 8 - Test 2
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00008', balance: 1000000000000000000000000, },
        // 9 - Test 3
        { secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00009', balance: 1000000000000000000000000, },
    ],
    debug: true,
    logger: { log: log.info, },
    blocktime: 0,
    hostname: '0.0.0.0',
    network_id: '1234',
    gasLimit: 0x6DDD00, // 7200000 http://coderstoolbox.net/number/
};

TestRPC
    .server(options)
    .listen(options.port, (err, state) => {
        if (err) {
            log.error(err);
        } else {
            log.info('EthereumJS TestRPC');

            log.info('Accounts:');
            Object.keys(state.accounts).forEach((address, index) =>
                log.info(
                    `(${index}) ${address}${state.isUnlocked(address) === false ? ' 🔒' : ''}, pKey: ${state.accounts[address].secretKey.toString('hex')}`)
            );

            log.info(`Listening on ${(options.hostname || 'localhost')}:${options.port}`);
        }
    });
