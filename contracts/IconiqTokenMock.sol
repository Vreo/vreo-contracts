pragma solidity 0.4.24;

contract IconiqTokenMock {

    mapping(address => uint) balances;

    constructor(address[] _investors, uint[] _amounts) public {
        require(_investors.length == _amounts.length);

        for (uint i = 0; i < _investors.length; ++i) {
            balances[_investors[i]] = _amounts[i];
        }
    }

    function balanceOf(address _investor) public view returns (uint) {
        return balances[_investor];
    }

}


