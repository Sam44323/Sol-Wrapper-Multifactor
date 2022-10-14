// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {
    constructor() ERC20("Wrapped Ether", "WETH") {}

    function mint() external payable {
        transferFrom(msg.sender, address(this), msg.value);
        _mint(msg.sender, msg.value / 10**18);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount / 10**18);
        payable(msg.sender).transfer(amount / 10**18);
    }
}
