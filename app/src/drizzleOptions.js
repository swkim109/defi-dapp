import SimpleStorage from "./contracts/SimpleStorage.json";
import BasePool from "./contracts/BasePool.json";

const INFURA_KEY = "";

const options = {
    web3: {
        
        fallback: {
            type: "ws",
            url: `wss://rinkeby.infura.io/ws/v3/${INFURA_KEY}`
        }
    },
    contracts: [SimpleStorage, BasePool],
    events: {
        SimpleStorage: ["Change"],
        BasePool: ["Deposited", "Withdrawn", "Rewarded", "RewardFailed"]
    },
    // polls: {
    //     blocks: 5000
    // },
    // syncAlways: true
};

export default options;
