#!/usr/bin/env node

const TestRPC = require('ethereumjs-testrpc');
const log = require('../util/logger');

const options = {
    port: 9545,
    accounts: [
        // 0 - deployer                 0x3deee88a871433a5709c93ef63eb04f4eace0ac5
        {
            secretKey: '0xfbdab455fa027cfcc5b847b4541f0d9b3ee9f176bcc2dd60acdbb26c30e00000',
            balance: 1000000000000000000000000,
        },
        // 1 - new owner & FD.Owner     0x2e781b96a14485cdbf7e9457b71165558b1f7d3a
        {
            secretKey: '0xcba39ec99dfca0db448b4bafad7049b7a504c6557a53c65bb4ef0cc219300001',
            balance: 1000000000000000000000000,
        },
        // 2 - FD.Funder                0x14be1f9cd06d3f349eb6d8cf7de951684473259f
        {
            secretKey: '0x7e2b1d0ae9f7bb8e935ac215ab42e8342bd31830a570cf08c9c2a2a5a4400002',
            balance: 1000000000000000000000000,
        },
        // 3 - FD.CustomersAdmin        0x39b39e40a4b1ee645f7c1db320683a9569103172
        {
            secretKey: '0xee49329dbe74c4d2866a7d0278b3110749fa03e7404021d2d15810c1b8f00003',
            balance: 1000000000000000000000000,
        },
        // 4 - FD.Emeregency            0xe2d9511ea485455d41565dabc42b418c7bc9a227
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00004',
            balance: 1000000000000000000000000,
        },
        // 5 - Customer                 0xb013ca96eb504cd1b23414d3b6b8bffbae9a4762
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00005',
            balance: 1000000000000000000000,
        },
        // 6 - Bridge deployer          0x3e2d627980a50742f604e36d6f1b799948095d23
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00006',
            balance: 1000000000000000000000000,
        },
        // 7 - Test 1                   0xb99d717dfacbc4bd89285b47734e0dfe67e80bf9
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00007',
            balance: 1000000000000000000000000,
        },
        // 8 - Test 2                   0x7ac8134f559aaa178618dbc98e552aa82dd0bd7c
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00008',
            balance: 1000000000000000000000000,
        },
        // 9 - Test 3                   0xebf9a8df6f1adc7d18dbc49b7b656287b770b1bf
        {
            secretKey: '0x945377fad41211126252e15f9390dd20ffb43f4d637eda54b8e6b9c10eb00009',
            balance: 1000000000000000000000000,
        },
    ],
    debug: false,
    logger: {
        log: log.info,
    },
    blocktime: 0,
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
                log.info(`(${index}) ${address}${state.isUnlocked(address) === false ? ' 🔒' : ''}, pKey: ${state.accounts[address].secretKey.toString('hex')}`));

            log.info(`Listening on ${(options.hostname || 'localhost')}:${options.port}`);
        }
    });
