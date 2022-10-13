// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }
}

contract TimeLockTargetCaller {
    address public timelock;

    constructor(address _timelock) {
        timelock = _timelock;
    }

    function testCaller() external view returns (uint) {
        require(
            msg.sender == timelock,
            "caller needs to be a timelock contract"
        );
        return 1;
    }
}
