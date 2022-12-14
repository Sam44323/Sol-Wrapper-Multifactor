// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Wrapped Ether", "WETH") {}

    fallback() external payable {
        this.mint();
    }

    receive() external payable {
        this.mint();
    }

    function mint() external payable {
        _mint(msg.sender, msg.value);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}
