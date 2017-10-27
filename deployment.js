module.exports = {
    networks: {
        mainnet: {
            addressResolver: '0x63338bB37Bc3A0d55d2E9505F11E56c613b51494',
            FD: {
                deployer: '',
                owner: '',
                funder: '0xb5771324A8209c4b581a5f1e5c0DD48a9ABA2a59', // multisig
                CustomersAdmin: '',
                Emergency: '',
            },
        },
        kovan: {
            addressResolver: '0x48fbda035c53d7d4e7a0ac8adc1fd88e541e7336',
            FD: {
                deployer: '',
                owner: '',
                funder: '0x74c90c06e20113c9e628f9ce374611db28da1f93', // multisig
                CustomersAdmin: '',
                Emergency: '',
            },
        },
        development: {
            addressResolver: '0x48fbda035c53d7d4e7a0ac8adc1fd88e541e7336',
            FD: {
                deployer: '0x3deee88a871433a5709c93ef63eb04f4eace0ac5',
                owner: '0x2e781b96a14485cdbf7e9457b71165558b1f7d3a',
                funder: '0x74c90c06e20113c9e628f9ce374611db28da1f93',
                CustomersAdmin: '0x39b39e40a4b1ee645f7c1db320683a9569103172',
                Emergency: '0xe2d9511ea485455d41565dabc42b418c7bc9a227',
            },
        },
    },
};



