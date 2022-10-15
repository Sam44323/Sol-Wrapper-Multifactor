// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Token zero", "T0") {}

    function mint() external payable {
        _mint(msg.sender, msg.value);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
