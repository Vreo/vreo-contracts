"use strict";

const IconiqToken = artifacts.require("IconiqTokenMock");
const VreoToken = artifacts.require("VreoToken.sol");
const VreoTokenSale = artifacts.require("VreoTokenSale.sol");

const BN = web3.BigNumber;
const {expect} = require("chai").use(require("chai-bignumber")(BN));
const {rejectTx, rejectDeploy, log, logGas, currency,
       duration, now, sleep, increaseTimeTo, randomAddr} = require("./helpers/common");


contract("VreoTokenSale", ([owner,
                            investor1,
                            investor2,
                            investor3,
                            largeIconiqHolder,
                            smallIconiqHolder,
                            tinyIconiqHolder,
                            nonIconiqHolder,
                            anyone]) => {
    // Constants: token amounts
    //                                        M  k  1
    const TOTAL_TOKEN_CAP         = new BN("700000000e18");
    const TOTAL_TOKEN_CAP_OF_SALE = new BN("450000000e18");
    const TOKEN_SHARE_OF_TEAM     = new BN( "85000000e18");
    const TOKEN_SHARE_OF_ADVISORS = new BN( "58000000e18");
    const TOKEN_SHARE_OF_LEGALS   = new BN( "57000000e18");
    const TOKEN_SHARE_OF_BOUNTY   = new BN( "50000000e18");

    // Constants: percentages
    const BONUS_PCT_IN_ICONIQ_SALE       = 30;
    const BONUS_PCT_IN_VREO_SALE_PHASE_1 = 20;
    const BONUS_PCT_IN_VREO_SALE_PHASE_2 = 10;

    // Constants: timing (CEST = UTC+2)
    const timestamp = string => Math.trunc((new Date(string)).getTime() / 1000);
    const ICONIQ_SALE_OPENING_TIME   = timestamp("2018-07-01 10:00:00 +2");
    const ICONIQ_SALE_CLOSING_TIME   = timestamp("2018-07-14 22:00:00 +2");
    const VREO_SALE_OPENING_TIME     = timestamp("2018-07-21 10:00:00 +2");
    const VREO_SALE_PHASE_1_END_TIME = timestamp("2018-07-24 22:00:00 +2");
    const VREO_SALE_PHASE_2_END_TIME = timestamp("2018-08-01 22:00:00 +2");
    const VREO_SALE_CLOSING_TIME     = timestamp("2018-08-18 22:00:00 +2");
    const KYC_VERIFICATION_END_TIME  = timestamp("2018-09-01 22:00:00 +2");

    // Constants: wei amounts
    const ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI = 500;

    // Helper function: default deployment parameters
    const defaultParams = () => {
        return {rate: 10000,
                teamAddress: randomAddr(),
                advisorsAddress: randomAddr(),
                legalsAddress: randomAddr(),
                bountyAddress: randomAddr(),
                wallet: randomAddr()};
    };

    // Helper function: deploy VreoTokenSale contract (and a VreoToken if not given)
    // Missing parameters will be set to default values
    const deployTokenSale = async args => {
        let params = defaultParams();

        if (args !== undefined) {
            for (let name in args) {
                params[name] = args[name];
            }
        }
        if (!("token" in params)) {
            params.token = (await VreoToken.new({from: owner})).address;
        }
        if(!("iconiqToken" in params)) {
            let totalAmount = new BN("20000000e18");
            let tinyAmount = totalAmount.divToInt(1000);
            let smallAmount = totalAmount.divToInt(3);
            let largeAmount = totalAmount.minus(smallAmount).minus(tinyAmount);

            params.iconiqToken = (await IconiqToken.new([largeIconiqHolder, smallIconiqHolder, tinyIconiqHolder],
                                                        [largeAmount, smallAmount, tinyAmount],
                                                        {from: owner})).address;
        }

        return VreoTokenSale.new(params.token,
                                 params.rate,
                                 params.iconiqToken,
                                 params.teamAddress,
                                 params.advisorsAddress,
                                 params.legalsAddress,
                                 params.bountyAddress,
                                 params.wallet,
                                 {from: owner});
    };

    // Actual unit tests

    before("ensure we've reasonable constants", () => {
        expect(TOTAL_TOKEN_CAP).to.be.bignumber.equal(TOTAL_TOKEN_CAP_OF_SALE
                                                      .plus(TOKEN_SHARE_OF_TEAM)
                                                      .plus(TOKEN_SHARE_OF_ADVISORS)
                                                      .plus(TOKEN_SHARE_OF_LEGALS)
                                                      .plus(TOKEN_SHARE_OF_BOUNTY));

        expect(BONUS_PCT_IN_ICONIQ_SALE).to.be.bignumber.above(BONUS_PCT_IN_VREO_SALE_PHASE_1);
        expect(BONUS_PCT_IN_VREO_SALE_PHASE_1).to.be.bignumber.above(BONUS_PCT_IN_VREO_SALE_PHASE_2);
        expect(BONUS_PCT_IN_VREO_SALE_PHASE_2).to.be.bignumber.above(0);

        expect(ICONIQ_SALE_OPENING_TIME).to.be.bignumber.below(ICONIQ_SALE_CLOSING_TIME);
        expect(ICONIQ_SALE_CLOSING_TIME).to.be.bignumber.below(VREO_SALE_OPENING_TIME);
        expect(VREO_SALE_OPENING_TIME).to.be.bignumber.below(VREO_SALE_PHASE_1_END_TIME);
        expect(VREO_SALE_PHASE_1_END_TIME).to.be.bignumber.below(VREO_SALE_PHASE_2_END_TIME);
        expect(VREO_SALE_PHASE_2_END_TIME).to.be.bignumber.below(VREO_SALE_CLOSING_TIME);
        expect(VREO_SALE_CLOSING_TIME).to.be.bignumber.below(KYC_VERIFICATION_END_TIME);
    });

    describe("deployment", () => {

        describe("with invalid parameters", () => {

            it("fails if token address is zero", async () => {
                await rejectDeploy(deployTokenSale({token: 0x0}));
            });

            it("fails if token is not properly capped", async () => {
                await rejectDeploy(deployTokenSale({token: 0xDEADBEEF}));
            });

            it("fails if rate is zero", async () => {
                await rejectDeploy(deployTokenSale({rate: 0}));
            });

            it("fails if iconiq token address is zero", async () => {
                await rejectDeploy(deployTokenSale({iconiqToken: 0x0}));
            });

            it("fails if team address is zero", async () => {
                await rejectDeploy(deployTokenSale({teamAddress: 0x0}));
            });

            it("fails if advisors address is zero", async () => {
                await rejectDeploy(deployTokenSale({advisorsAddress: 0x0}));
            });

            it("fails if legals address is zero", async () => {
                await rejectDeploy(deployTokenSale({legalsAddress: 0x0}));
            });

            it("fails if bounty address is zero", async () => {
                await rejectDeploy(deployTokenSale({bountyAddress: 0x0}));
            });

            it("fails if wallet address is zero", async () => {
                await rejectDeploy(deployTokenSale({wallet: 0x0}));
            });
        });

        describe("with valid parameters", () => {
            let params = defaultParams();
            let token;
            let sale;

            it("succeeds", async () => {
                token = await VreoToken.new({from: owner});
                params.token = token.address;
                sale = await deployTokenSale(params);
                expect(await web3.eth.getCode(sale.address)).to.be.not.oneOf(["0x", "0x0"]);
            });

            it("has correct token amount constants", async () => {
                expect(await sale.TOTAL_TOKEN_CAP_OF_SALE()).to.be.bignumber.equal(TOTAL_TOKEN_CAP_OF_SALE);
                expect(await sale.TOKEN_SHARE_OF_TEAM()).to.be.bignumber.equal(TOKEN_SHARE_OF_TEAM);
                expect(await sale.TOKEN_SHARE_OF_ADVISORS()).to.be.bignumber.equal(TOKEN_SHARE_OF_ADVISORS);
                expect(await sale.TOKEN_SHARE_OF_LEGALS()).to.be.bignumber.equal(TOKEN_SHARE_OF_LEGALS);
                expect(await sale.TOKEN_SHARE_OF_BOUNTY()).to.be.bignumber.equal(TOKEN_SHARE_OF_BOUNTY);
            });

            it("has correct bonus percentage constants", async () => {
                expect(await sale.BONUS_PCT_IN_ICONIQ_SALE()).to.be.bignumber.equal(BONUS_PCT_IN_ICONIQ_SALE);
                expect(await sale.BONUS_PCT_IN_VREO_SALE_PHASE_1()).to.be.bignumber.equal(BONUS_PCT_IN_VREO_SALE_PHASE_1);
                expect(await sale.BONUS_PCT_IN_VREO_SALE_PHASE_2()).to.be.bignumber.equal(BONUS_PCT_IN_VREO_SALE_PHASE_2);
            });

            it("has correct timing constants", async () => {
                expect(await sale.ICONIQ_SALE_OPENING_TIME()).to.be.bignumber.equal(ICONIQ_SALE_OPENING_TIME);
                expect(await sale.ICONIQ_SALE_CLOSING_TIME()).to.be.bignumber.equal(ICONIQ_SALE_CLOSING_TIME);
                expect(await sale.VREO_SALE_OPENING_TIME()).to.be.bignumber.equal(VREO_SALE_OPENING_TIME);
                expect(await sale.VREO_SALE_PHASE_1_END_TIME()).to.be.bignumber.equal(VREO_SALE_PHASE_1_END_TIME);
                expect(await sale.VREO_SALE_PHASE_2_END_TIME()).to.be.bignumber.equal(VREO_SALE_PHASE_2_END_TIME);
                expect(await sale.VREO_SALE_CLOSING_TIME()).to.be.bignumber.equal(VREO_SALE_CLOSING_TIME);
                expect(await sale.KYC_VERIFICATION_END_TIME()).to.be.bignumber.equal(KYC_VERIFICATION_END_TIME);
            });

            it("sets correct owner", async () => {
                expect(await sale.owner()).to.be.bignumber.equal(owner);
            });

            it("sets correct token address", async () => {
                expect(await sale.token()).to.be.bignumber.equal(token.address)
            });

            it("sets correct rate", async () => {
                expect(await sale.rate()).to.be.bignumber.equal(params.rate);
            });

            it("sets correct opening time", async () => {
                expect(await sale.openingTime()).to.be.bignumber.equal(ICONIQ_SALE_OPENING_TIME);
            });

            it("sets correct closing time", async () => {
                expect(await sale.closingTime()).to.be.bignumber.equal(VREO_SALE_CLOSING_TIME);
            });

            it("sets correct team address", async () => {
                expect(await sale.teamAddress()).to.be.bignumber.equal(params.teamAddress);
            });

            it("sets correct advisors address", async () => {
                expect(await sale.advisorsAddress()).to.be.bignumber.equal(params.advisorsAddress);
            });

            it("sets correct legals address", async () => {
                expect(await sale.legalsAddress()).to.be.bignumber.equal(params.legalsAddress);
            });

            it("sets correct bounty address", async () => {
                expect(await sale.bountyAddress()).to.be.bignumber.equal(params.bountyAddress);
            });

            it("sets correct wallet address", async () => {
                expect(await sale.wallet()).to.be.bignumber.equal(params.wallet);
            });

            it("sets correct amount of remaining tokens for sale", async () => {
                expect(await sale.remainingTokensForSale()).to.be.bignumber.equal(TOTAL_TOKEN_CAP_OF_SALE);
            });
        });
    });

    describe("rate change", () => {
        let sale;

        before("deploy", async () => {
            sale = await deployTokenSale();
        });

        it("is forbidden for anyone but owner", async () => {
            let rate = await sale.rate();
            await rejectTx(sale.setRate(rate.plus(1), {from: anyone}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is zero", async () => {
            let rate = await sale.rate();
            await rejectTx(sale.setRate(0, {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is equal or below a tenth of current", async () => {
            let rate = await sale.rate();
            await rejectTx(sale.setRate(rate.divToInt(10), {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is equal or above ten times of current", async () => {
            let rate = await sale.rate();
            await rejectTx(sale.setRate(rate.times(10), {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is possible", async () => {
            let newRate = (await sale.rate()).times(2);
            let tx = await sale.setRate(newRate, {from: owner});
            let log = tx.logs.find(log => log.event === "RateChanged");
            expect(log).to.exist;
            expect(log.args.newRate).to.be.bignumber.equal(newRate);
            expect(await sale.rate()).to.be.bignumber.equal(newRate);
        });
    });

    describe("private presale token distribution", () => {
        let token, sale;

        before("deploy", async () => {
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
        });

        it("is forbidden for anyone but owner", async () => {
            let totalSupply = await token.totalSupply();
            await rejectTx(sale.distributePresale([investor1, investor2], [10, 20], {from: anyone}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is forbidden if number of investors is not equal to number of amounts", async () => {
            let totalSupply = await token.totalSupply();
            await rejectTx(sale.distributePresale([investor1], [10, 20], {from: owner}));
            await rejectTx(sale.distributePresale([investor1, investor2], [10], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is possible", async () => {
            await sale.distributePresale([], [], {from: owner});
        });

        it("increases token balance of private investors", async () => {
            let balance = await token.balanceOf(investor1);
            let amount = new BN("2525e18");
            await sale.distributePresale([investor1], [amount], {from: owner});
            expect(await token.balanceOf(investor1)).to.be.bignumber.equal(balance.plus(amount));
        });

        it("increases total supply of tokens", async () => {
            let totalSupply = await token.totalSupply();
            let amount = new BN("3535e18");
            await sale.distributePresale([investor1], [amount], {from: owner});
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply.plus(amount));
        });

        it("decreases remaining tokens for sale", async () => {
            let remaining = await sale.remainingTokensForSale();
            let amount = new BN("4545e18");
            await sale.distributePresale([investor1], [amount], {from: owner});
            expect(await sale.remainingTokensForSale()).to.be.bignumber.equal(remaining.minus(amount));
        });

        it("is possible for many (i.e. > 2) investors at once", async () => {
            await logGas(sale.distributePresale([], [], {from: owner}), "no investors");
            let nSucc = 0;
            let nFail = -1;
            let nTest = 1;
            while (nTest != nSucc) {
                let investors = [];
                let amounts = [];
                for (let i = 0; i < nTest; ++i) {
                    investors.push(randomAddr());
                    amounts.push(i);
                }
                let success = true;
                try {
                    await logGas(sale.distributePresale(investors, amounts, {from: owner}), nTest + " investors");
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

        it("is forbidden if amount exceeds cap", async () => {
            let totalSupply = await token.totalSupply();
            let remaining = await sale.remainingTokensForSale();
            await rejectTx(sale.distributePresale([investor1], [remaining.plus(1)], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is forbidden if amount exceeds cap even if tokens were burnt", async () => {
            let totalSupply = await token.totalSupply();
            let amount = new BN("5555e18");
            await sale.distributePresale([investor2], [amount], {from: owner});
            let remaining = await sale.remainingTokensForSale();
            await token.burn(amount, {from: investor2});
            await rejectTx(sale.distributePresale([investor1], [remaining.plus(1)], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is possible if amount reaches cap", async () => {
            let balance = await token.balanceOf(investor1);
            let remaining = await sale.remainingTokensForSale();
            await sale.distributePresale([investor1], [remaining], {from: owner});
            expect(await token.balanceOf(investor1)).to.be.bignumber.equal(balance.plus(remaining));
            expect(await sale.remainingTokensForSale()).to.be.bignumber.zero;
        });

        it("is forbidden if tokens were sold out", async () => {
            let totalSupply = await token.totalSupply();
            await rejectTx(sale.distributePresale([investor1], [1], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });
    });

    describe("before iconic sale", () => {
        let token, sale;

        before("deploy", async () => {
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
        });

        it("is possible to distribute presold tokens to private investors", async () => {
            await sale.distributePresale([anyone], [new BN("1000e18")], {from: owner});
        });
    });

    describe("during iconiq sale", () => {
    });

    describe("between iconiq and vreo sale", () => {
    });

    describe("during phase 1 of vreo sale", () => {
    });

    describe("during phase 2 of vreo sale", () => {
    });

    describe("during phase 3 of vreo sale", () => {
    });

    describe("after vreo sale until KYC verification end", () => {
    });

    describe("between KYC verification end and finalization", () => {
    });

    describe("after finalization", () => {
    });

});

