pragma solidity 0.4.24;

import "Crowdsale.sol";
import "Ownable.sol";


/// @title PostKYCCrowdsale
/// @author Autogenerated from a Dia UML diagram
contract PostKYCCrowdsale is Crowdsale, Ownable {

    struct Investment {
        bool isVerified; // wether or not the investor passed the KYC process
        uint weiAmount; // invested wei
        uint tokenAmount; // amount of token quantums the investor wants to purchase
    }

    mapping(address => Investment) public investments;

    /// @dev Log entry on investor verified
    /// @param investor An Ethereum address
    event InvestorVerified(address investor);

    /// @dev Log entry on tokens delivered
    /// @param investor An Ethereum address
    /// @param amount A positive number
    event TokensDelivered(address investor, uint amount);

    /// @dev Log entry on withdrawn
    /// @param investor An Ethereum address
    /// @param value A positive number
    event Withdrawn(address investor, uint value);

    /// @dev Verify investors
    /// @param _investors A list where each entry is an Ethereum address
    function verifyInvestors(address[] _investors) public onlyOwner {
        require(IMPLEMENTATION);
    }

    /// @dev Withdraw
    function withdraw() public {
        require(IMPLEMENTATION);
    }

    /// @dev Pre validate purchase
    /// @param _beneficiary An Ethereum address
    /// @param _weiAmount A positive number
    function _preValidatePurchase(address _beneficiary, uint _weiAmount) internal {
        require(IMPLEMENTATION);
    }

    /// @dev Process purchase
    /// @param  An Ethereum address
    /// @param _tokenAmount A positive number
    function _processPurchase(address, uint _tokenAmount) internal {
        require(IMPLEMENTATION);
    }

    /// @dev Forward funds
    function _forwardFunds() internal {
        require(IMPLEMENTATION);
    }

    /// @dev Forward funds
    /// @param _weiAmount A positive number
    function _forwardFunds(uint _weiAmount) internal {
        require(IMPLEMENTATION);
    }

}
