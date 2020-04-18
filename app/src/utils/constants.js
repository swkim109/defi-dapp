const Web3 = require('web3');

const ROY = "0xAFc4F9F3bA806dd2F8e47A524fFDa2418bBFc08a";
const TONY = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SALT   = "0x9994123412341234123412341234123412341234123412341234123412341236";
const SECRET = "0xe661badaee5f9d10f7040797264804abca436db390e775929dc5edfc3e77f661";
const SECRET_HASH = new Web3().utils.soliditySha3(SECRET, SALT);

// MCD contracts info https://changelog.makerdao.com/
// MCD v1.0.4
const DAI_CONTRACT_KOVAN = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";

// Compound contracts info at each networks https://compound.finance/docs#guides
// https://github.com/compound-finance/compound-protocol/blob/master/networks/rinkeby.json
const DAI_CONTRACT_RINKEBY = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa";

// https://github.com/compound-finance/compound-protocol/blob/master/networks/kovan.json
const cDAI_CONTRACT_KOVAN = "0xe7bc397DBd069fC7d0109C0636d06888bb50668c";

// https://github.com/compound-finance/compound-protocol/blob/master/networks/rinkeby.json
const cDAI_CONTRACT_RINKEBY = "0x6D7F0754FFeb405d23C51CE938289d4835bE3b14";

// default target network
const DAI_CONTRACT = DAI_CONTRACT_RINKEBY;
const cDAI_CONTRACT = cDAI_CONTRACT_RINKEBY;

module.exports = {
    ROY,
    TONY,
    ZERO_ADDRESS,
    SALT,
    SECRET,
    SECRET_HASH,
    DAI_CONTRACT_KOVAN,
    DAI_CONTRACT_RINKEBY,
    cDAI_CONTRACT_KOVAN,
    cDAI_CONTRACT_RINKEBY,
    DAI_CONTRACT,
    cDAI_CONTRACT
}

