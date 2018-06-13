pragma solidity 0.4.24;

import "../zeppelin/token/ERC20/ERC20Basic.sol";
import "../zeppelin/crowdsale/distribution/FinalizableCrowdsale.sol";
import "../zeppelin/crowdsale/emission/MintedCrowdsale.sol";
import "./TokenCappedCrowdsale.sol";
import "./PostKYCCrowdsale.sol";
import "./IconiqInterface.sol";
import "./VreoToken.sol";


/// @title VreoTokenSale
/// @author Autogenerated from a Dia UML diagram
contract VreoTokenSale is PostKYCCrowdsale, TokenCappedCrowdsale, FinalizableCrowdsale, MintedCrowdsale {

    // Maxmimum number of tokens sold in Presale+Iconiq+Vreo sales
    uint public constant TOTAL_TOKEN_CAP_OF_SALE = 450000000e18;  // = 450.000.000 e18

    // Extra tokens minted upon finalization
    uint public constant TOKEN_SHARE_OF_TEAM     =  85000000e18;  // =  85.000.000 e18
    uint public constant TOKEN_SHARE_OF_ADVISORS =  58000000e18;  // =  58.000.000 e18
    uint public constant TOKEN_SHARE_OF_LEGALS   =  57000000e18;  // =  57.000.000 e18
    uint public constant TOKEN_SHARE_OF_BOUNTY   =  50000000e18;  // =  50.000.000 e18

    // Extra token percentages
    uint public constant BONUS_PCT_IN_ICONIQ_SALE       = 30;  // TBD
    uint public constant BONUS_PCT_IN_VREO_SALE_PHASE_1 = 20;
    uint public constant BONUS_PCT_IN_VREO_SALE_PHASE_2 = 10;

    // Date/time constants
    uint public constant ICONIQ_SALE_OPENING_TIME   = 1530432000;  // 2018-07-01 10:00:00 CEST
    uint public constant ICONIQ_SALE_CLOSING_TIME   = 1531598400;  // 2018-07-14 22:00:00 CEST
    uint public constant VREO_SALE_OPENING_TIME     = 1532160000;  // 2018-07-21 10:00:00 CEST
    uint public constant VREO_SALE_PHASE_1_END_TIME = 1532462400;  // 2018-07-24 22:00:00 CEST
    uint public constant VREO_SALE_PHASE_2_END_TIME = 1533153600;  // 2018-08-01 22:00:00 CEST
    uint public constant VREO_SALE_CLOSING_TIME     = 1534622400;  // 2018-08-18 22:00:00 CEST
    uint public constant KYC_VERIFICATION_END_TIME  = 1535832000;  // 2018-09-01 22:00:00 CEST

    uint public constant MINIMUM_LIFETIME_AFTER_END = 365 days;

    IconiqInterface public iconiq;
    address public teamAddress;
    address public advisorsAddress;
    address public legalsAddress;
    address public bountyAddress;

    uint iconiqTotalEstimate;

    /// @dev Log entry on rate changed
    /// @param newRate A positive number
    event RateChanged(uint newRate);

    /// @dev Constructor
    /// @param _token A VreoToken
    /// @param _rate A positive number
    /// @param _iconiq An IconiqInterface
    /// @param _teamAddress An Ethereum address
    /// @param _advisorsAddress An Ethereum address
    /// @param _legalsAddress An Ethereum address
    /// @param _bountyAddress A VreoTokenBounty
    /// @param _wallet An Ethereum address
    constructor(
        VreoToken _token,
        uint _rate,
        IconiqInterface _iconiq,
        address _teamAddress,
        address _advisorsAddress,
        address _legalsAddress,
        address _bountyAddress,
        address _wallet
    )
        public
        Crowdsale(_rate, _wallet, _token)
        TokenCappedCrowdsale(TOTAL_TOKEN_CAP_OF_SALE)
        TimedCrowdsale(ICONIQ_SALE_OPENING_TIME, VREO_SALE_CLOSING_TIME)
    {
        // Token sanity check
        require(_token.cap() >= TOTAL_TOKEN_CAP_OF_SALE
                                + TOKEN_SHARE_OF_TEAM
                                + TOKEN_SHARE_OF_ADVISORS
                                + TOKEN_SHARE_OF_LEGALS
                                + TOKEN_SHARE_OF_BOUNTY);

        // Sanity check of addresses
        require(address(_iconiq) != address(0)
                && _teamAddress != address(0)
                && _advisorsAddress != address(0)
                && _legalsAddress != address(0)
                && _bountyAddress != address(0));

        iconiq = _iconiq;
        teamAddress = _teamAddress;
        advisorsAddress = _advisorsAddress;
        legalsAddress = _legalsAddress;
        bountyAddress = _bountyAddress;

        iconiqTotalEstimate = ERC20Basic(iconiq).totalSupply();  // - iconiqBurned - iconiqShares ...
    }

    /// @dev Destroy
    function liquidate() public onlyOwner {
        require(now >= KYC_VERIFICATION_END_TIME + MINIMUM_LIFETIME_AFTER_END);

        owner.transfer(address(this).balance);
        //selfdestruct(owner);
    }

    /// @dev Distribute presale
    /// @param _investors A list where each entry is an Ethereum address
    /// @param _amounts A list where each entry is a positive number
    function distributePresale(address[] _investors, uint[] _amounts) public onlyOwner {
        require(_investors.length == _amounts.length);

        uint totalAmount = 0;

        for (uint i = 0; i < _investors.length; ++i) {
            VreoToken(token).mint(_investors[i], _amounts[i]);
            totalAmount = totalAmount.add(_amounts[i]);
        }

        remainingTokens = remainingTokens.sub(totalAmount);
    }

    /// @dev Set rate
    /// @param _newRate A positive number
    function setRate(uint _newRate) public onlyOwner {
        // A rate change by a magnitude order of ten and above is rather a typo than intention.
        // If it was indeed desired, several setRate transactions have to be sent.
        require(rate / 10 < _newRate && _newRate < 10 * rate);

        rate = _newRate;

        emit RateChanged(_newRate);
    }

    function getMaximumPossibleInvestment(address _investor) public view returns (uint) {
        // No tokens available anymore?
        if (remainingTokens == 0) {
            return 0;
        }

        // Iconiq sale period
        if (ICONIQ_SALE_OPENING_TIME <= now && now <= ICONIQ_SALE_CLOSING_TIME) {
            // How many MEROs the investor purchased so far
            uint balance;
            if (investments[_investor].isVerified) {
                balance = token.balanceOf(_investor);
            }
            else {
                balance = investments[_investor].tokenAmount;
            }

            // Ensure the investor has Iconiq tokens
            uint iconiqBalance = ERC20Basic(iconiq).balanceOf(_investor);
            if (iconiqBalance == 0) {
                return 0;
            }

            // Calculate prorata limit
            uint prorataLimit = TOTAL_TOKEN_CAP_OF_SALE.mul(iconiqBalance).div(iconiqTotalEstimate);

            // Did the investor already reached his prorata limit?
            if (balance >= prorataLimit) {
                return 0;
            }

            // How many additional MEROs the investor can buy.
            uint tokenLimit = prorataLimit - balance;
            if (tokenLimit > remainingTokens) {
                tokenLimit = remainingTokens;
            }

            return tokenLimit.div(rate.mul((100 + BONUS_PCT_IN_ICONIQ_SALE) / 100));
        }

        // Vreo sale period
        if (VREO_SALE_OPENING_TIME <= now && now <= VREO_SALE_CLOSING_TIME) {
            if (now <= VREO_SALE_PHASE_1_END_TIME) {
                return remainingTokens.div(rate.mul((100 + BONUS_PCT_IN_VREO_SALE_PHASE_1) / 100));
            }

            if (now <= VREO_SALE_PHASE_2_END_TIME) {
                return remainingTokens.div(rate.mul((100 + BONUS_PCT_IN_VREO_SALE_PHASE_2) / 100));
            }

            return remainingTokens.div(rate);
        }

        // Outside of any sale period
        return 0;
    }

    /// @dev Pre validate purchase
    /// @param _beneficiary An Ethereum address
    /// @param _weiAmount A positive number
    function _preValidatePurchase(address _beneficiary, uint _weiAmount) internal {
        //require(ICONIQ_SALE_OPENING_TIME <= now && now <= ICONIQ_SALE_CLOSING_TIME && iconiq.isAllowed(msg.sender)
        //        || VREO_SALE_OPENING_TIME <= now && now <= VREO_SALE_CLOSING_TIME);

        uint maximumPossibleInvestment = getMaximumPossibleInvestment(msg.sender);

        require(0 < maximumPossibleInvestment && _weiAmount <= maximumPossibleInvestment);

        super._preValidatePurchase(_beneficiary, _weiAmount);
    }

    /// @dev Get token amount
    /// @param _weiAmount A positive number
    /// @return A positive number
    function _getTokenAmount(uint _weiAmount) internal view returns (uint) {
        uint amount = super._getTokenAmount(_weiAmount);

        if (now <= ICONIQ_SALE_CLOSING_TIME) {
            return amount.mul(100 + BONUS_PCT_IN_ICONIQ_SALE).div(100);
        }

        if (now <= VREO_SALE_PHASE_1_END_TIME) {
            return amount.mul(100 + BONUS_PCT_IN_VREO_SALE_PHASE_1).div(100);
        }

        if (now <= VREO_SALE_PHASE_2_END_TIME) {
            return amount.mul(100 + BONUS_PCT_IN_VREO_SALE_PHASE_2).div(100);
        }

        return amount;  // No bonus
    }

    /// @dev Finalization
    function finalization() internal {
        require(now >= KYC_VERIFICATION_END_TIME);

        MintableToken(token).mint(teamAddress, TOKEN_SHARE_OF_TEAM);
        MintableToken(token).mint(advisorsAddress, TOKEN_SHARE_OF_ADVISORS);
        MintableToken(token).mint(legalsAddress, TOKEN_SHARE_OF_LEGALS);
        MintableToken(token).mint(bountyAddress, TOKEN_SHARE_OF_BOUNTY);

        VreoToken(token).finishMinting();
        VreoToken(token).unpause();

        super.finalization();
    }

}

