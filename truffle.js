module.exports = {
    networks: {
        mainnet: {
            network_id: 1, // Ethereum public network
            host: 'localhost',
            port: 8545,
            from: '0x6f692c070f3263d1c3400367832faf5ccc6cd2f2', // 0 - deployer
            gas: 5000000,
            gasPrice: 4000000000,
        },
        mainnet2: {
            network_id: 1, // Ethereum public network
            host: '35.158.95.25',
            port: 8545,
            from: '0x6f692c070f3263d1c3400367832faf5ccc6cd2f2', // 0 - deployer
        },
        kovan: {
            network_id: 42, // custom private network
            host: 'localhost',
            port: 8545,
            from: '0x1885bf0a04c6948061007cb556935a903b1bed95', // 0 - deployer
            unlock: [
                '0x189a99226ad233df825cc1f9d48c8afba529b803', // 1 - new owner & FD.Owner
                '0x1d45c059e511241a5c1b3081e56302a59621c94c', // 2 - FD.Funder
                '0x5226d6ce4d0b84ec9f8214ee4f5883738dad130e', // 3 - FD.CustomersAdmin
                '0x6e5dc1285a441627c0046604586b081bbe41fbc8', // 4 - FD.Emeregency
                '0x79e3c795890175180c492b66b69f0d35ff031de4', // 5 - Customer
                '0xa3a645c963ca4c03328afbd9a79f45716b492231', // 6 - Test 1
                '0xc3878b8566f5626fb8d6ad43b647e3405668f20b', // 7 - Test 2
                '0xc95efc83de5832510dac2c29198279eb8662d77e', // 8 - Test 3
            ], // to unlock in parity
            addressResolver: '0x48fbda035c53d7d4e7a0ac8adc1fd88e541e7336',
            funder: '0x74c90c06e20113c9e628f9ce374611db28da1f93', // multisig
            gas: 4500036,
        },
        ropsten: {
            network_id: 3, // custom private network
            host: '0.0.0.0',
            port: 8545,
            from: '0x19707FA3BBBaaB91a35c838B69a041eb823AC465', // 0 - deployer
            unlock: [
                '0x5186aF3a9728DA85B60d4d2Bf325cF6c6FdF3410', // 1 - new owner & FD.Owner
                '0x5A8e2e9e253E9ea8D329e9f9230799Fd4a4Fe687', // 2 - FD.Funder
                '0x6fcc2bA0c8D4C785a033D8388EdcBfEe3222a38B', // 3 - FD.CustomersAdmin
                '0x7EA6CaE3B0badD43A2Ce56eE59E0f596F82AbE31', // 4 - FD.Emeregency
                '0xABA9Af9d055211530F8b7A9950Feb70FF9E9B7c2', // 5 - Customer
                '0xbB4dB85946b3C45ccC658E7C6Adb4ae6B8B981d7', // 6 - Test 1
                '0xCa8833b60A78A28e6d28403Dd3B20C20770f6A3C', // 7 - Test 2
                '0xdbf0d8b90F1AbFfDe270bAAd45Bd0e56bC768d87', // 8 - Test 3
            ], // to unlock in parity
            addressResolver: '0xa18a7468d6fc9df9664a82b37f4944061e0f5958',
            gas: 4700000,
        },
        development: {
            // host: 'docker.for.mac.localhost',
            host: 'localhost',
            port: 9545,
            network_id: '*',
        },
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
};
