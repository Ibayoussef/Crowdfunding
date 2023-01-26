// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract CustomToken is ERC20Capped, ERC20Burnable {
    uint256 public totalCoins;

    constructor(uint256 _totalSupply, uint256 _cap)
        ERC20("CustomToken", "CSS")
        ERC20Capped(_cap * (10**decimals()))
    {
        totalCoins = _totalSupply * (10**decimals());
        _mint(msg.sender, totalCoins);
    }

    function _mint(address account, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Capped)
    {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "ERC20Capped: cap exceeded"
        );
        super._mint(account, amount);
    }
}
