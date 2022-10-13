// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }
}
