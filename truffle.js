module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    // //共有网络
    // "live": {
    //   network_id: 1
    // },
    // //官方测试网络
    // "morden": {
    //   network_id: 2,
    // },
    //自定义私用网络
    "staging": {
      host: "127.0.0.1",
      port: 8545,
      //gas: 1763673286,
      //gasPrice: 10000000000,
      //from: "0xCA88d71Aa9C47A9506C37503c3676A98635DED6a",
      network_id: "*", // Match any network id
      //network_id: 10086,
    },
  },
  // solc: { optimizer: { enabled: true, runs: 200 } }
};
