module.exports = {
    networks: {
        mainnet: {
            network_id: 1,
            host: 'localhost',
            port: 8545,
            from: '0x581ddc02cc6ae6e495a91d3c7f6adf75085609f8',
            gas: 6000000,
            gasPrice: 4000000000,
        },
        ropsten: {
            network_id: 3, // custom private network
            host: 'localhost',
            port: 8545,
            from: '0x581ddc02cc6ae6e495a91d3c7f6adf75085609f8',
            gas: 6000000,
            gasPrice: 4000000000,
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
