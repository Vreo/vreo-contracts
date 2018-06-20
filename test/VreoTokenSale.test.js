"use strict";

const IconiqToken = artifacts.require("IconiqTokenMock");
const VreoToken = artifacts.require("VreoToken.sol");
const VreoTokenSale = artifacts.require("VreoTokenSale.sol");

const BN = web3.BigNumber;
const {expect} = require("chai").use(require("chai-bignumber")(BN));
const {random, time, money, reject, snapshot, logGas} = require("./helpers/common");


contract("VreoTokenSale", accounts => {
    const owner = accounts.shift();
    const anyone = accounts.shift();

    // Constants: token amounts               M  k  1
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
    const ICONIQ_SALE_OPENING_TIME   = time.from("2018-07-01 10:00:00 +2");
    const ICONIQ_SALE_CLOSING_TIME   = time.from("2018-07-14 22:00:00 +2");
    const VREO_SALE_OPENING_TIME     = time.from("2018-07-21 10:00:00 +2");
    const VREO_SALE_PHASE_1_END_TIME = time.from("2018-07-24 22:00:00 +2");
    const VREO_SALE_PHASE_2_END_TIME = time.from("2018-08-01 22:00:00 +2");
    const VREO_SALE_CLOSING_TIME     = time.from("2018-08-18 22:00:00 +2");
    const KYC_VERIFICATION_END_TIME  = time.from("2018-09-01 22:00:00 +2");

    // Constants: iconiq sale constraint
    const ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI = 500;

    // Helper function: default deployment parameters
    const defaultParams = () => {
        return {rate: 10000,
                teamAddress: random.address(),
                advisorsAddress: random.address(),
                legalsAddress: random.address(),
                bountyAddress: random.address(),
                wallet: random.address()};
    };reject.tx

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
        if (!("iconiqToken" in params)) {
            params.iconiqToken = (await IconiqToken.new(new BN("20000000e18"), {from: owner})).address;
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

    // Helper function: "cast" Investment structure
    const Investment = ([isVerified, totalWeiInvested, pendingTokenAmount]) =>
                       ({isVerified, totalWeiInvested, pendingTokenAmount});

    // ----8<----
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

    let initialState;

    before("save initial state", async () => {
        initialState = await snapshot.create();
    });

    after("revert to initial state", async () => {
        await snapshot.revert(initialState);
    });

    describe("deployment", () => {

        describe("with invalid parameters", () => {

            it("fails if token address is zero", async () => {
                await reject.deploy(deployTokenSale({token: 0x0}));
            });

            it("fails if token is not properly capped", async () => {
                await reject.deploy(deployTokenSale({token: 0xDEADBEEF}));
            });

            it("fails if rate is zero", async () => {
                await reject.deploy(deployTokenSale({rate: 0}));
            });

            it("fails if iconiq token address is zero", async () => {
                await reject.deploy(deployTokenSale({iconiqToken: 0x0}));
            });

            it("fails if team address is zero", async () => {
                await reject.deploy(deployTokenSale({teamAddress: 0x0}));
            });

            it("fails if advisors address is zero", async () => {
                await reject.deploy(deployTokenSale({advisorsAddress: 0x0}));
            });

            it("fails if legals address is zero", async () => {
                await reject.deploy(deployTokenSale({legalsAddress: 0x0}));
            });

            it("fails if bounty address is zero", async () => {
                await reject.deploy(deployTokenSale({bountyAddress: 0x0}));
            });

            it("fails if wallet address is zero", async () => {
                await reject.deploy(deployTokenSale({wallet: 0x0}));
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
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
        });

        it("is forbidden for anyone but owner", async () => {
            let rate = await sale.rate();
            await reject.tx(sale.setRate(rate.plus(1), {from: anyone}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is zero", async () => {
            let rate = await sale.rate();
            await reject.tx(sale.setRate(0, {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is equal or below a tenth of current", async () => {
            let rate = await sale.rate();
            await reject.tx(sale.setRate(rate.divToInt(10), {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is forbidden if new rate is equal or above ten times of current", async () => {
            let rate = await sale.rate();
            await reject.tx(sale.setRate(rate.times(10), {from: owner}));
            expect(await sale.rate()).to.be.bignumber.equal(rate);
        });

        it("is possible", async () => {
            let newRate = (await sale.rate()).times(2);
            let tx = await sale.setRate(newRate, {from: owner});
            let entry = tx.logs.find(entry => entry.event === "RateChanged");
            expect(entry).to.exist;
            expect(entry.args.newRate).to.be.bignumber.equal(newRate);
            expect(await sale.rate()).to.be.bignumber.equal(newRate);
        });
    });

    describe("private presale token distribution", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
        });

        it("is forbidden for anyone but owner", async () => {
            let privateInvestor1 = random.address(),
                privateInvestor2 = random.address();
            let totalSupply = await token.totalSupply();
            await reject.tx(sale.distributePresale([privateInvestor1, privateInvestor2], [10, 20], {from: anyone}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is forbidden if number of investors is not equal to number of amounts", async () => {
            let privateInvestor1 = random.address(),
                privateInvestor2 = random.address();
            let totalSupply = await token.totalSupply();
            await reject.tx(sale.distributePresale([privateInvestor1], [10, 20], {from: owner}));
            await reject.tx(sale.distributePresale([privateInvestor1, privateInvestor2], [10], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is possible", async () => {
            await sale.distributePresale([], [], {from: owner});
        });

        it("increases token balance of private investors", async () => {
            let privateInvestor = random.address();
            let balance = await token.balanceOf(privateInvestor);
            let amount = new BN("2525e18");
            await sale.distributePresale([privateInvestor], [amount], {from: owner});
            expect(await token.balanceOf(privateInvestor)).to.be.bignumber.equal(balance.plus(amount));
        });

        it("increases total supply of tokens", async () => {
            let totalSupply = await token.totalSupply();
            let amount = new BN("3535e18");
            await sale.distributePresale([random.address()], [amount], {from: owner});
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply.plus(amount));
        });

        it("decreases remaining tokens for sale", async () => {
            let remaining = await sale.remainingTokensForSale();
            let amount = new BN("4545e18");
            await sale.distributePresale([random.address()], [amount], {from: owner});
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
                    investors.push(random.address());
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
            await reject.tx(sale.distributePresale([random.address()], [remaining.plus(1)], {from: owner}));
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
        });

        it("is forbidden if amount exceeds cap even if tokens were burnt", async () => {
            let totalSupply = await token.totalSupply();
            let amount = new BN("5555e18");
            await sale.distributePresale([anyone], [amount], {from: owner});
            let remaining = await sale.remainingTokensForSale();
            await token.burn(amount, {from: anyone});
            expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
            await reject.tx(sale.distributePresale([random.address()], [remaining.plus(1)], {from: owner}));
        });

        it("is possible if amount reaches cap", async () => {
            let privateInvestor = random.address();
            let balance = await token.balanceOf(privateInvestor);
            let remaining = await sale.remainingTokensForSale();
            await sale.distributePresale([privateInvestor], [remaining], {from: owner});
            expect(await token.balanceOf(privateInvestor)).to.be.bignumber.equal(balance.plus(remaining));
            expect(await sale.remainingTokensForSale()).to.be.bignumber.zero;
        });

        it("is forbidden if tokens were sold out", async () => {
            let remaining = await sale.remainingTokensForSale();
            await sale.distributePresale([random.address()], [remaining], {from: owner});
            await reject.tx(sale.distributePresale([random.address()], [1], {from: owner}));
        });
    });

    describe("investor verification", () => {
        let sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            await (await VreoToken.at(await sale.token())).transferOwnership(sale.address, {from: owner});
        });

        it("is forbidden for anyone but owner", async () => {
            let investor = random.address();
            await reject.tx(sale.verifyInvestors([investor], {from: anyone}));
            expect(Investment(await sale.investments(investor)).isVerified).to.be.false;
        });

        it("is possible", async () => {
            let investor = random.address();
            let tx = await sale.verifyInvestors([investor], {from: owner});
            let entry = tx.logs.find(entry => entry.event === "InvestorVerified");
            expect(entry).to.exist;
            expect(entry.args.investor).to.be.bignumber.equal(investor);
            expect(Investment(await sale.investments(investor)).isVerified).to.be.true;
        });

        it("is possible for many (i.e. > 2) investors at once", async () => {
            await logGas(sale.verifyInvestors([], {from: owner}), "no investors");
            let nSucc = 0;
            let nFail = -1;
            let nTest = 1;
            while (nTest != nSucc) {
                let investors = [];
                for (let i = 0; i < nTest; ++i) {
                    investors.push(random.address());
                }
                let success = true;
                try {
                    await logGas(sale.verifyInvestors(investors, {from: owner}), nTest + " investors");
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
    });

    describe("before sales", () => {
        let iconiq, token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            iconiq = await IconiqToken.at(await sale.iconiqToken());
            await token.transferOwnership(sale.address, {from: owner});
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });

        describe("presale distribution", () => {

            it("is possible", async () => {
                await sale.distributePresale([random.address()], [new BN("1000e18")], {from: owner});
            });
        });

        describe("token purchase", () => {

            it("is forbidden, even for iconiq holders", async () => {
                let buyer = accounts[0];
                await iconiq.setBalance(buyer, await iconiq.totalSupply());
                await reject.tx(sale.buyTokens(buyer, {from: buyer, value: 1}));
            });
        });

        describe("investor verification", () => {

            it("is possible", async () => {
                let investor = random.address();
                await sale.verifyInvestors([investor], {from: owner});
                expect(Investment(await sale.investments(investor)).isVerified).to.be.true;
            });
        });
    });

    describe("during iconiq sale", () => {
        let iconiq, token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            iconiq = await IconiqToken.at(await sale.iconiqToken());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(ICONIQ_SALE_OPENING_TIME);
        });

        describe("time conditions", () => {

            it("iconiq sale is ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.true;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });

        describe("maximum possible investment", () => {
            const iconiqHolder = accounts[0];

            it("is zero for non iconiq holders", async () => {
                expect(await sale.getIconiqMaxInvestment(anyone)).to.be.bignumber.zero;
            });

            it("is zero if iconiq balance is too small", async () => {
                await iconiq.setBalance(iconiqHolder, ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI - 1);
                expect(await sale.getIconiqMaxInvestment(iconiqHolder)).to.be.bignumber.zero;
            });

            it("is one wei if iconiq balance is minimum value", async () => {
                await iconiq.setBalance(iconiqHolder, ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI);
                expect(await sale.getIconiqMaxInvestment(iconiqHolder)).to.be.bignumber.equal(1);
            });

            it("is correctly calculated", async () => {
                let maxInvestment = money.ether(42);
                await iconiq.setBalance(iconiqHolder, maxInvestment.times(ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI));
                expect(await sale.getIconiqMaxInvestment(iconiqHolder)).to.be.bignumber.equal(maxInvestment);
            });
        });

        describe("token purchase", () => {
            const investor = accounts[0];
            let startState;

            before("save start state", async () => {
                startState = await snapshot.create();
            });

            beforeEach("restore start state", async () => {
                await snapshot.revert(startState);
                startState = await snapshot.create();
            });

            afterEach("invariant: token supply is below sale cap", async () => {
                expect(await token.totalSupply()).to.be.bignumber.most(TOTAL_TOKEN_CAP_OF_SALE);
            });

            it("is forbidden for non iconiq holders", async () => {
                await reject.tx(sale.buyTokens(anyone, {from: anyone, value: 1}));
            });

            it("is forbidden if beneficiary is not owner", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                await reject.tx(sale.buyTokens(anyone, {from: investor, value: 1}));
            });

            it("is forbidden if wei amount is zero", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                await reject.tx(sale.buyTokens(investor, {from: investor, value: 0}));
            });

            it("is forbidden if wei amount exceeds investment limit", async () => {
                await iconiq.setBalance(investor, money.ether(3).times(ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI));
                let maxValue = await sale.getIconiqMaxInvestment(investor);
                await reject.tx(sale.buyTokens(investor, {from: investor, value: maxValue.plus(1)}));
            });

            it("is forbidden if wei amount plus previously invested wei exceeds investment limit", async () => {
                let value = money.ether(2);
                let maxValue = value.times(2).minus(1);
                await iconiq.setBalance(investor, maxValue.times(ICONIQ_TOKENS_NEEDED_PER_INVESTED_WEI));
                await sale.buyTokens(investor, {from: investor, value});
                await reject.tx(sale.buyTokens(investor, {from: investor, value}));
            });

            it("by unverified investors emits a TokenPurchase but no TokensDelivered event", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let value = money.ether(2);
                let amount = value.times(await sale.rate()).times(100 + BONUS_PCT_IN_ICONIQ_SALE).divToInt(100);
                let tx = await sale.buyTokens(investor, {from: investor, value});
                let purchaseEntry = tx.logs.find(entry => entry.event === "TokenPurchase");
                expect(purchaseEntry).to.exist;
                expect(purchaseEntry.args.purchaser).to.be.bignumber.equal(investor);
                expect(purchaseEntry.args.beneficiary).to.be.bignumber.equal(investor);
                expect(purchaseEntry.args.value).to.be.bignumber.equal(value);
                expect(purchaseEntry.args.amount).to.be.bignumber.equal(amount);
                let deliverEntry = tx.logs.find(entry => entry.event === "TokensDelivered");
                expect(deliverEntry).to.not.exist;
            });

            it("by unverified investors doesn't change the total supply", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let totalSupply = await token.totalSupply();
                await sale.buyTokens(investor, {from: investor, value: money.ether(2)});
                expect(await token.totalSupply()).to.be.bignumber.equal(totalSupply);
            });

            it("by unverified investors doesn't decrease remaining tokens", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let remaining = await sale.remainingTokensForSale();
                await sale.buyTokens(investor, {from: investor, value: money.ether(2)});
                expect(await sale.remainingTokensForSale()).to.be.bignumber.equal(remaining);
            });

            it("by unverified investors increases their total investment", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let invested = Investment(await sale.investments(investor)).totalWeiInvested;
                let value = money.ether(2);
                await sale.buyTokens(investor, {from: investor, value});
                let invested1 = Investment(await sale.investments(investor)).totalWeiInvested;
                expect(invested1).to.be.bignumber.equal(invested.plus(value));
                await sale.buyTokens(investor, {from: investor, value});
                let invested2 = Investment(await sale.investments(investor)).totalWeiInvested;
                expect(invested2).to.be.bignumber.equal(invested.plus(value.times(2)));
            });

            it("by unverified investors increases their pending tokens", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let pending = Investment(await sale.investments(investor)).pendingTokenAmount;
                let value = money.ether(2);
                let amount = value.mul(await sale.rate()).times(100 + BONUS_PCT_IN_ICONIQ_SALE).divToInt(100);
                await sale.buyTokens(investor, {from: investor, value});
                let pending1 = Investment(await sale.investments(investor)).pendingTokenAmount;
                expect(pending1).to.be.bignumber.equal(pending.plus(amount));
                await sale.buyTokens(investor, {from: investor, value});
                let pending2 = Investment(await sale.investments(investor)).pendingTokenAmount;
                expect(pending2).to.be.bignumber.equal(pending.plus(amount.times(2)));
            });

            /*
            it("by unverified investors does not decrease remaining tokens", async () => {
                await iconiq.setBalance(investor, await iconiq.totalSupply());
                let remaining = await sale.remainingTokensForSale();
                let value = money.ether(2);
                let amount1 = value.mul(await sale.rate()).times(100 + BONUS_PCT_IN_ICONIQ_SALE).divToInt(100);
                let amount2 = amount1.times(2);
                await sale.buyTokens(investor, {from: investor, value});
                expect(await sale.remainingTokensForSale()).to.be.bignumber.equal(remaining.minus(amount1));
                await sale.buyTokens(investor, {from: investor, value});
                expect(await sale.remainingTokensForSale()).to.be.bignumber.equal(remaining.minus(amount2));
            });
            */
        });
    });

    describe("between iconiq and vreo sale", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(ICONIQ_SALE_CLOSING_TIME + time.secs(1));
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("during phase 1 of vreo sale", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(VREO_SALE_OPENING_TIME);
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.true;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("during phase 2 of vreo sale", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(VREO_SALE_PHASE_1_END_TIME + time.secs(1));
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.true;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("during phase 3 of vreo sale", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(VREO_SALE_PHASE_2_END_TIME + time.secs(1));
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.true;
            });

            it("sale is not closed", async () => {
                expect(await sale.hasClosed()).to.be.false;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("after sales until KYC verification end", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(VREO_SALE_CLOSING_TIME + time.secs(1));
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is closed", async () => {
                expect(await sale.hasClosed()).to.be.true;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("between KYC verification end and finalization", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(KYC_VERIFICATION_END_TIME + time.secs(1));
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is closed", async () => {
                expect(await sale.hasClosed()).to.be.true;
            });

            it("minting is not finished", async () => {
                expect(await token.mintingFinished()).to.be.false;
            });
        });
    });

    describe("after finalization", () => {
        let token, sale;

        before("deploy", async () => {
            await snapshot.revert(initialState);
            initialState = await snapshot.create();
            sale = await deployTokenSale();
            token = await VreoToken.at(await sale.token());
            await token.transferOwnership(sale.address, {from: owner});
            await time.increaseTo(KYC_VERIFICATION_END_TIME + time.secs(1));
            await sale.finalize({from: owner});
        });

        describe("time conditions", () => {

            it("iconiq sale is not ongoing", async () => {
                expect(await sale.iconiqSaleOngoing()).to.be.false;
            });

            it("vreo sale is not ongoing", async () => {
                expect(await sale.vreoSaleOngoing()).to.be.false;
            });

            it("sale is closed", async () => {
                expect(await sale.hasClosed()).to.be.true;
            });

            it("minting is finished", async () => {
                expect(await token.mintingFinished()).to.be.true;
            });
        });
    });

});

