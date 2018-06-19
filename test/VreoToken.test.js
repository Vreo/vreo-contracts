"use strict";

const VreoToken = artifacts.require("VreoToken.sol");

const BN = web3.BigNumber;
const {expect} = require("chai").use(require("chai-bignumber")(BN));


contract("VreoToken", ([owner]) => {
    //                          M  k  1
    const TOKEN_CAP = new BN("700000000e18");

    const TOKEN_NAME = "MERO Token";
    const TOKEN_SYMBOL = "MERO";
    const TOKEN_DECIMALS = 18;

    describe("deployment", () => {
        let token;

        it("succeeds", async () => {
            token = await VreoToken.new({from: owner});
            expect(await web3.eth.getCode(token.address)).to.be.not.oneOf(["0x", "0x0"]);
        });

        it("has correct name", async () => {
            expect(await token.name()).to.be.equal(TOKEN_NAME);
        });

        it("has correct symbol", async () => {
            expect(await token.symbol()).to.be.equal(TOKEN_SYMBOL);
        });

        it("has correct number of decimals", async () => {
            expect(await token.decimals()).to.be.bignumber.equal(TOKEN_DECIMALS);
        });

        it("sets correct owner", async () => {
            expect(await token.owner()).to.be.bignumber.equal(owner);
        });

        it("sets correct cap", async () => {
            expect(await token.cap()).to.be.bignumber.equal(TOKEN_CAP);
        });

        it("is initially paused", async () => {
            expect(await token.paused()).to.be.true;
        });
    });

});

