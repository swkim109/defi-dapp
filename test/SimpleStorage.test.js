const SimpleStorage = artifacts.require("SimpleStorage");


const {
    BN,           // Big Number support
    expectEvent,  // Assertions for emitted events
    expectRevert, // Assertions for transactions that should fail
} = require("@openzeppelin/test-helpers");

contract ("SimpleStorage", function () {

    before( async () => {
        this.instance = await SimpleStorage.deployed();
    });

    it ("should be failed if the value exceeds the limit", async () => {

        let err = null;
        try {

            const tx = await this.instance.set(1000);

        } catch ( error ) {
            err = error;
            if (error.message !== null && error.message.length > 0) {
                const reasonArr = error.message.match(/Reason given: (.*)\./);
                console.log(reasonArr[1]);
            }
        }

        assert.isOk(err instanceof Error, "The value exceeds the limit");

    });
    
    it ("should emit Change event", async () => {

        const receipt = await this.instance.set(500);

        expectEvent(receipt, "Change", {
            message: "set",
            newVal: new BN(500)
        });
    });

    it.skip ("should change the value", async () => {

        const tx = await this.instance.set(1200);
        //console.log(tx);
        const val  = await this.instance.get();
        assert.equal(1200, val, "The result is incorrect!");

    })



})
