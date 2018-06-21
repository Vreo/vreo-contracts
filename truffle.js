module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    networks: {
        development: {
            network_id: "*",
            host: "127.0.0.1",
            port: 8545
        }
    },
    mocha: {
        reporter: "eth-gas-reporter"
    }
};

