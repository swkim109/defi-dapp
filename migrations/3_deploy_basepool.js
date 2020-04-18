const basePool = artifacts.require("BasePool");
const sortitionSumTreeFactory = artifacts.require("SortitionSumTreeFactory");
const drawLib = artifacts.require("DrawLib");
const constants = require("../app/src/utils/constants");

module.exports = function(deployer, network) {
   
    deployer.deploy(sortitionSumTreeFactory);
    deployer.link(sortitionSumTreeFactory, [drawLib, basePool]);
    
    deployer.deploy(basePool, constants.cDAI_CONTRACT);
    
    // if (network === "kovan") {
    //     deployer.deploy(basePool, constants.cDAI_CONTRACT_KOVAN);
    // } else if (network === "rinkeby") {
    //     deployer.deploy(basePool, constants.cDAI_CONTRACT_RINKEBY);
    // }
    
};
