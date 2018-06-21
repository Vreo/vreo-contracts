"use strict";

const VreoToken = artifacts.require("VreoToken.sol");
const VreoTokenBounty = artifacts.require("VreoTokenBounty.sol");

const BN = web3.BigNumber;
const {expect} = require("chai").use(require("chai-bignumber")(BN));
const {random, reject, logGas} = require("./helpers/common");


contract("VreoTokenSale", ([owner, anyone]) => {
    let token, bounty;

    describe("deployment", () => {

        it("fails if provided token address is zero", async () => {
            await reject.deploy(VreoTokenBounty.new(0x0, {from: owner}));
        });

        it("is possible", async () => {
            token = await VreoToken.new({from: owner});
            bounty = await VreoTokenBounty.new(token.address, {from: owner});
        });

        it("sets correct owner", async () => {
            expect(await bounty.owner()).to.be.bignumber.equal(owner);
        });

        it("sets correct token address", async () => {
            expect(await bounty.token()).to.be.bignumber.equal(token.address);
        });
    });

    describe("token distribution", () => {

        before("mint some tokens for the benefit of bounty contract", async () => {
            await token.mint(bounty.address, new BN("123456e18"), {from: owner});
            await token.unpause({from: owner});
        });

        it("is forbidden for anyone but owner", async () => {
            let recipient1 = random.address(),
                recipient2 = random.address();
            let totalSupply = await token.totalSupply();
            await reject.tx(bounty.distributeTokens([recipient1, recipient2], [10, 20], {from: anyone}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is forbidden if number of recipients is not equal to number of amounts", async () => {
            let recipient1 = random.address(),
                recipient2 = random.address();
            let totalSupply = await token.totalSupply();
            await reject.tx(bounty.distributeTokens([recipient1], [10, 20], {from: owner}));
            await reject.tx(bounty.distributeTokens([recipient1, recipient2], [10], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is possible", async () => {
            await bounty.distributeTokens([], [], {from: owner});
        });

        it("decreases token balance of bounty contract", async () => {
            let recipient = random.address();
            let balance = await token.balanceOf(bounty.address);
            let amount = new BN("2525e18");
            await bounty.distributeTokens([recipient], [amount], {from: owner});
            expect(await token.balanceOf(bounty.address)).to.be.bignumber.equal(balance.minus(amount));
        });

        it("increases token balance of recipients", async () => {
            let recipient = random.address();
            let balance = await token.balanceOf(recipient);
            let amount = new BN("3535e18");
            await bounty.distributeTokens([recipient], [amount], {from: owner});
            expect(await token.balanceOf(recipient)).to.be.bignumber.equal(balance.plus(amount));
        });

        it.skip("is possible for many (i.e. > 2) recipients at once", async () => {
            await logGas(bounty.distributeTokens([], [], {from: owner}), "no recipients");
            let nSucc = 0;
            let nFail = -1;
            let nTest = 1;
            while (nTest != nSucc && nTest < 1024) {
                let recipients = [];
                let amounts = [];
                for (let i = 0; i < nTest; ++i) {
                    recipients.push(random.address());
                    amounts.push(i);
                }
                let success = true;
                try {
                    await logGas(bounty.distributeTokens(recipients, amounts, {from: owner}), nTest + " recipients");
                }
                catch (error) {
                    success = false;
                }
                if (success) {
                    nSucc = nTest;
                    nTest = nFail < 0 ? 2 * nTest : Math.trunc((nTest + nFail) / 2);
                }
                else {
                    nFail = nTest;
                    nTest = Math.trunc((nSucc + nTest) / 2);
                }
            }
            expect(nSucc).to.be.at.above(2);
        });

        it("is forbidden if amount exceeds balance", async () => {
            let available = await token.balanceOf(bounty.address);
            await reject.tx(bounty.distributeTokens([random.address()], [available.plus(1)], {from: owner}));
            expect(await token.balanceOf(bounty.address)).to.be.bignumber.equal(available);
        });
    });

});
