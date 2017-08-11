module.exports = {

  networks: {
    mainnet: {
      network_id: 1, // Ethereum public network
      host: "localhost",
      port: 8545,
      from: "0xfee595b6b4a30bfa12604a5ec92156f1b5a1607f"
    },
    ropsten: {
      network_id: 3, // Official Ethereum test network
      host: "localhost",
      port: 8545,
      from: "0x39ecc2b084f83ca2a6939dd88e18542c29320fbd"
    },
    kovan: {
      network_id: 123, // custom private network
      host: "localhost",
      port: 8545,
      from: "0xc3878b8566f5626fb8d6ad43b647e3405668f20b",
      gas: 6500000
    },
    testrpc: {
      host: "localhost",
      port: 9545,
      network_id: "*"
    },
  }
};
