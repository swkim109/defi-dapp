const basePool = artifacts.require("BasePool");
const constants = require("../constants");

const {
    BN,           // Big Number support
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

// 1 ticket = 1 DAI so minimum deposit is 1 DAI
const TICKET_PRICE_1 = new BN(web3.utils.toWei("1", "ether"));
const TICKET_PRICE_3 = new BN(web3.utils.toWei("3", "ether"));
const TICKET_PRICE_5 = new BN(web3.utils.toWei("5", "ether"));
const TICKET_PRICE_7 = new BN(web3.utils.toWei("7", "ether"));
const TICKET_PRICE_10 = new BN(web3.utils.toWei("10", "ether"));
const TICKET_PRICE_20 = new BN(web3.utils.toWei("20", "ether"));

let totalDeposit = new BN(0);

contract ("BasePool-SumTree", function([_, _user1, _user2, _user3, _user4, _user5]) {
    
    before(async () => {
        
        this.instance = await basePool.deployed();
    });
    
    it ("should open the first draw of ID 1", async () => {
        const receipt = await this.instance.openDraw(constants.SECRET_HASH, {from: _});
        expectEvent(receipt, "Opened", {
            drawId: new BN(1),
            secretHash: constants.SECRET_HASH
        });
    });
    
    it ("add to DrawTree and deposit by user", async () => {
        totalDeposit = totalDeposit.add(TICKET_PRICE_1);
        const tx = await this.instance.addTreeNode(_user1, TICKET_PRICE_1);
        assert.ok(tx.receipt.status, "Failed to add nodes to DrawTree");
    });

    it ("add to DrawTree and deposit by user", async () => {
        totalDeposit = totalDeposit.add(TICKET_PRICE_5);
        const tx = await this.instance.addTreeNode(_user1, TICKET_PRICE_5);
        assert.ok(tx.receipt.status, "Failed to add nodes to DrawTree");
    });

    it ("add to DrawTree and deposit by user", async () => {
        totalDeposit = totalDeposit.add(TICKET_PRICE_10);
        const tx = await this.instance.addTreeNode(_user2, TICKET_PRICE_10);
        assert.ok(tx.receipt.status, "Failed to add nodes to DrawTree");
    });
    
    it ("add to DrawTree and deposit by user", async () => {
        totalDeposit = totalDeposit.add(TICKET_PRICE_3);
        const tx = await this.instance.addTreeNode(_user3, TICKET_PRICE_3);
        assert.ok(tx.receipt.status, "Failed to add nodes to DrawTree");
    });

    it ("should be same as total sum of deposit", async () => {
        const drawId = await this.instance.currentOpenDrawId();
        const result = await this.instance.getTotalOfDrawTree(drawId.toNumber());

        expect(result.eq(totalDeposit), "Total sum of the all nodes is different from the deposits by users").to.be.true;
    });
    
    it ("user\'s total deposit and ticket price is same", async () => {
    
        const deposit = await this.instance.getBalanceOfDrawTree(_user1);
        const tickets = TICKET_PRICE_1.add(TICKET_PRICE_5);
        expect(deposit.eq(tickets), "deposit and ticket price is not equal");
    });
    
    it ("pick a winner from the current draw", async () => {

        const tx = await this.instance.reward(constants.SECRET, constants.SALT);

        let result = tx.receipt.status;

        if (tx.logs !== undefined && tx.logs.length > 0) {
            //console.log(tx.receipt.status);
            tx.logs.forEach((log) => {
                if (log.event === "Rewarded") {
                    console.log(`Winner is ${log.args.winner.toString()}, Reward is ${log.args.netWinnings}`);
                } else {
                    result = false;
                }
            });
        }
        assert.equal(result, true, "Failed to pick a winner");

    });
    
});
