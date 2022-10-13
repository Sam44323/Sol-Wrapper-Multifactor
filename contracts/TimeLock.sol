// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    function queue(
        address _target,
        uint value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) external onlyOwner {}

    function execute() external {
        /**
         * @Step1: create a tx id
         * @Step2: check if the tx id is in the queue i.e. unique
         * @Step3: check if the timestamp is in the future
         * @Step4: queue the transaction
         */
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
