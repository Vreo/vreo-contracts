pragma solidity 0.4.23;

import "ERC827Token.sol";
import "CappedToken.sol";
import "PausableToken.sol";
import "StandardBurnableToken.sol";


/// @title VreoToken
/// @author Autogenerated from a Dia UML diagram
contract VreoToken is ERC827Token, CappedToken, PausableToken, StandardBurnableToken {

    string public name = "Vreo Token";
    string public symbol = "VREO";
    uint8 public decimals = 18;
    mapping(address => bool) public minters;

    /// @dev Log entry on minter added
    /// @param minter An Ethereum address
    event MinterAdded(address minter);

    /// @dev Log entry on minter removed
    /// @param minter An Ethereum address
    event MinterRemoved(address minter);

    /// @dev Ensure only minter
    modifier onlyMinter() {
        require(IMPLEMENTATION);
        _;
    }

    /// @dev Constructor
    /// @param _cap A positive number
    constructor(uint _cap) public CappedToken(_cap) {
        require(IMPLEMENTATION);
    }

    /// @dev Add minter
    /// @param _minter An Ethereum address
    function addMinter(address _minter) public onlyOwner {
        require(IMPLEMENTATION);
    }

    /// @dev Remove minter
    /// @param _minter An Ethereum address
    function removeMinter(address _minter) public onlyOwner {
        require(IMPLEMENTATION);
    }

    /// @dev Mint
    /// @param _to An Ethereum address
    /// @param _amount A positive number
    /// @return True or false
    function mint(address _to, uint _amount) public onlyMinter canMint returns (bool) {
        require(IMPLEMENTATION);
    }

}
