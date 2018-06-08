pragma solidity 0.4.24;

import "CappedToken.sol";
import "PausableToken.sol";
import "BurnableToken.sol";


/// @title VreoToken
/// @author Autogenerated from a Dia UML diagram
contract VreoToken is CappedToken, PausableToken, BurnableToken {

    uint public TOTAL_TOKEN_CAP = 700000000e18; // = 700.000.000 e18
    string public name = "MERO Token";
    string public symbol = "MERO";
    uint8 public decimals = 18;

    /// @dev Constructor
    constructor() public CappedToken(TOTAL_TOKEN_CAP) {
        require(IMPLEMENTATION);
    }

    /// @dev Burn
    /// @param _value A positive number
    function burn(uint _value) public whenNotPaused {
        require(IMPLEMENTATION);
    }

}

