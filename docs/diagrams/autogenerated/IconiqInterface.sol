pragma solidity 0.4.24;


/// @title IconiqInterface
/// @author Autogenerated from a Dia UML diagram
interface IconiqInterface {

    /// @dev Is allowed
    /// @param _investor An Ethereum address
    /// @return True or false
    function isAllowed(address _investor) external view returns (bool);

}
