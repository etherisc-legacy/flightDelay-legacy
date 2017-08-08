module.exports = {

  networks: {
    "live": {
      network_id: 1, // Ethereum public network
      host: "localhost",
      port: 8545,
      // from: t.b.d.
    },
    "ropsten": {
      network_id: 3, // Official Ethereum test network
      host: "localhost",
      port: 8645,
      from: "0xffc614ee978630d7fb0c06758deb580c152154d3"
    },
    "kovan": {
      network_id: 123, // custom private network
      host: "localhost",
      port: 8745,
      from: "0x285fac8db312f4db8bf771f9a5553be36d0db196",
      // use default rpc settings
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
  }
};