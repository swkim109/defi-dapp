const basePool = artifacts.require("BasePool");
const constants = require("../app/src/utils/constants");
const abi = require("../app/src/utils/contract.abi");

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

contract ("BasePool", function([_, _user1, _user2, _user3]) {
    
    before(async () => {
        
        this.instance = await basePool.deployed();
        //this.instance = await basePool.at("0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb");
        this.cDaiContract = new web3.eth.Contract(abi.cDAI, constants.cDAI_CONTRACT);
        this.daiContract = new web3.eth.Contract(abi.DAI, constants.DAI_CONTRACT);
    });
    
    it ("deployer should have admin role", async () => {
        const result = await this.instance.isAdmin(_);
        expect(result, "Account does not have admin role").to.be.true;
        
    });
    
    it ("should open the first draw of ID 1", async () => {
        const receipt = await this.instance.openDraw(constants.SECRET_HASH, {from: _});
        expectEvent(receipt, "Opened", {
            drawId: new BN(1),
            secretHash: constants.SECRET_HASH
        });
    });
    
    it ("should get the current draw ID", async () => {
        const drawId = await this.instance.currentOpenDrawId();
        expect(drawId.eq(new BN(1))).to.be.true;
    });
    
    it.skip ("should revert when opening another draw", async () => {
        await expectRevert(
            this.instance.openDraw(constants.SECRET_HASH, {from: _}),
            "There is an open draw already",
        );
    });
    
    it ("should supply cToken to Compound pool", async () => {
        
        let balanceDAI = await this.daiContract.methods.balanceOf(constants.ROY).call();
        let balanceCDAI = await this.cDaiContract.methods.balanceOf(this.instance.address).call();
        //console.log(balanceDAI, balanceCDAI);
        
        const amount = TICKET_PRICE_3;
        const tx = await this.daiContract.methods.approve(this.instance.address, amount.toString()).send({from: constants.ROY});
        //console.log(tx.receipt.status);
        
        const receipt = await this.instance.buyTicket(amount.toString(), {from: constants.ROY});
        balanceCDAI = (await this.cDaiContract.methods.balanceOf(this.instance.address).call());
        
        expect(new BN(balanceCDAI).gt(new BN(0)), "failed to mint cDAI for the contract").to.be.true;
        //expectEvent(receipt, "Deposited", {sender: constants.ROY, amount: amount.toString()});
        
    });
    
    it ("withdraw some deposit from the tree and Compound pool", async () => {
        
        const balanceBefore = await this.daiContract.methods.balanceOf(constants.ROY).call();
        const depositBefore = await this.instance.getBalanceOfDrawTree(constants.ROY);
        
        // 티켓 한 장을 환불
        await this.instance.withdrawDepositFromDraw(TICKET_PRICE_1.toString(), {from: constants.ROY});
        
        const balanceAfter = await this.daiContract.methods.balanceOf(constants.ROY).call();
        const depositAfter = await this.instance.getBalanceOfDrawTree(constants.ROY);
        
        const balanceResult = new BN(balanceAfter).sub(new BN(balanceBefore)); // 1 증가
        const depositResult = new BN(depositBefore).sub(new BN(depositAfter)); // 1 감소
        
        expect(depositResult.eq(TICKET_PRICE_1), "value of remaining deposit is incorrect").to.be.true;
        
    });
    
    it ("pick a winner from the current draw", async () => {
        
        const tx = await this.instance.reward(constants.SECRET, constants.SALT);
        
        let result = tx.receipt.status;
        
        if (tx.logs !== undefined && tx.logs.length > 0) {
            //console.log(tx.receipt.status);
            tx.logs.forEach((log) => {
                if (log.event === "Rewarded") {
                    const r = web3.utils.fromWei(new BN(log.args.netWinnings), "ether");
                    console.log(`Winner is ${log.args.winner}, Reward is ${r} DAI`);
                } else {
                    result = false;
                }
            });
        }
        
        assert.equal(result, true, "Failed to pick a winner");
    });
    
    it.skip ("Dai balance of the contract", async () => {
        const accountedBalance = await this.instance.accountedBalance();
        console.log(web3.utils.fromWei(new BN(accountedBalance), "ether"));
        assert.equal(accountedBalance, accountedBalance, "DAI balance of the contract");
    });
    
    it ("should be failed to buy tickets after draw close", async () => {
        
        const amount = TICKET_PRICE_3;
        await this.daiContract.methods.approve(this.instance.address, amount.toString()).send({from: constants.ROY});
        
        await expectRevert(
            this.instance.buyTicket(amount.toString(), {from: constants.ROY}),
            "There is no opened draw",
        );
    });
    
    it ("should withdraw tokens from user\'s balances", async () => {
        
        await this.instance.withdrawDeposit(TICKET_PRICE_1, {from: constants.ROY});
        const remaining = new BN(await this.instance.balanceOf(constants.ROY));
        console.log(remaining.toString());
        
        expect(remaining.eq(TICKET_PRICE_1), "DAI balance of the user is incorrect");
        
    });
    
    it ("should open the second draw of ID 2", async () => {
        const receipt = await this.instance.openDraw(constants.SECRET_HASH, {from: _});
        expectEvent(receipt, "Opened", {
            drawId: new BN(2),
            secretHash: constants.SECRET_HASH
        });
    });
    
    it.skip ("should maintain the past records of the draw", async () => {
        const remaining = await this.instance.getBalanceOfDrawTreeById(1, constants.ROY);
        console.log(remaining.toString());
        assert.equal(1, 1, "OK");
    });
    
});
