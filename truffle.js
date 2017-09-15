module.exports = {
    networks: {
        mainnet: {
            network_id: 1, // Ethereum public network
            host: 'localhost',
            port: 8545,
            from: '0xfee595b6b4a30bfa12604a5ec92156f1b5a1607f',
            unlock: [
                '0xb77f7f6c5c916899ed6b40ee9b2bd05f8e71044c',
            ], // to unlock in parity
            gas: 6700000,
        },
        ropsten: {
            network_id: 3, // Official Ethereum test network
            host: 'localhost',
            port: 8545,
            from: '0x39ecc2b084f83ca2a6939dd88e18542c29320fbd',
            unlock: [
                '0xcf6cafaad72b9929613b891463b1f22ed1b08b00',
            ], // to unlock in parity
            gas: 4700000,
        },
        kovan: {
            network_id: 42, // custom private network
            host: 'localhost',
            port: 8545,
            from: '0xc3878b8566f5626fb8d6ad43b647e3405668f20b',
            unlock: [
                '0x1d45c059e511241a5c1b3081e56302a59621c94c',
                '0x79e3c795890175180c492b66b69f0d35ff031de4',
                '0xa3a645c963ca4c03328afbd9a79f45716b492231',
                '0x6e5dc1285a441627c0046604586b081bbe41fbc8',
                '0x189a99226ad233df825cc1f9d48c8afba529b803',
                '0x5226d6ce4d0b84ec9f8214ee4f5883738dad130e',
                '0x1885bf0a04c6948061007cb556935a903b1bed95',
                '0xd3ce03dfcc6b95c55f991b989b48bff28a9f3962',
                '0xc95efc83de5832510dac2c29198279eb8662d77e',
            ], // to unlock in parity
            gas: 6000000,
        },
        development: {
            network_id: '1234',
            host: 'localhost', // 'docker.for.mac.localhost',
            port: 9545,
            from: '0x2e781b96a14485cdbf7e9457b71165558b1f7d3a',
            gas: 6000000,
        },
    },
};
