module.exports = {

  networks: {
    mainnet: {
      network_id: 1, // Ethereum public network
      host: 'localhost',
      port: 8545,
      from: '0xfee595b6b4a30bfa12604a5ec92156f1b5a1607f',
      from2: '0xb77f7f6c5c916899ed6b40ee9b2bd05f8e71044c', // to unlock second account in parity
      gas: 6700000,
    },
    ropsten: {
      network_id: 3, // Official Ethereum test network
      host: 'localhost',
      port: 8645,
//      from: '0x11591D432d9Ff7cF517819ba99B3D876719019Dd', // Christoph's test ether
      from: '0x39ecc2b084f83ca2a6939dd88e18542c29320fbd',
      from2: '0xcf6cafaad72b9929613b891463b1f22ed1b08b00', // to unlock second account in parity
      gas: 4700000,
    },
    kovan: {
      network_id: 42, // kovan
      host: 'localhost',
      port: 8745,
      from: '0x11591D432d9Ff7cF517819ba99B3D876719019Dd', // Christoph's test ether
//      from: '0xc3878b8566f5626fb8d6ad43b647e3405668f20b', // Eugene's test ether
      from2: '0x1d45c059e511241a5c1b3081e56302a59621c94c', // to unlock second account in parity
      gas: 6000000,
    },
    testrpc: {
      // host: 'docker.for.mac.localhost',
      host: 'localhost',
      port: 9545,
      network_id: '*',
    },
  },
};
