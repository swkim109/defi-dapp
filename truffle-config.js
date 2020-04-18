const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

const INFURA_KEY = "";
const privateKeys = ["CAE1...4CFA",
                     "6CF5...8E80"];

module.exports = {
    
    contracts_build_directory: path.join(__dirname, "app/src/contracts"),

    networks: {
        development: {host: "127.0.0.1", port: 7545, network_id: "5777"},
        fork: {host: "127.0.0.1", port: 8545, network_id: "5777"}, // fork from testnet
        local: {host: "127.0.0.1", port: 8545, network_id: "44"},
        rinkeby : {
            provider: function() {
                return new HDWalletProvider(privateKeys, `https://rinkeby.infura.io/v3/${INFURA_KEY}`, 0);
            },
            network_id: "4",
            skipDryRun: true,
        },
        kovan : {
            provider: function() {
                return new HDWalletProvider(privateKeys, `https://kovan.infura.io/v3/${INFURA_KEY}`, 0);
            },
            network_id: "42",
            skipDryRun: true,
        }

    },
    plugins: [
        "truffle-plugin-verify"
    ],
    api_keys: {
        etherscan: "1W4S...YJXQ"
    }
};
