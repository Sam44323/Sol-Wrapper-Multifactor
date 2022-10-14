// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*
 * @description: TimeLock is a contract that publishes a transaction to be executed in the future. After a mimimum waiting period, the transaction can be executed.
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;

    event Queue(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        string func,
        bytes data,
        uint timestamp
    );

    event Execute(
        bytes32 indexed txId,
        address indexed target,
        uint value,
        string func,
        bytes data,
        uint timestamp
    );

    constructor() {
        _owner = msg.sender;
    }

    function computeTxId(
        address _target,
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(_target, _value, _func, _data, _timestamp));
    }

    function queue(
        address _target,
        uint value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) external onlyOwner {
        /**
         * @Step1: create a tx id
         * @Step2: check if the tx id is in the queue i.e. unique
         * @Step3: check if the timestamp is in the future
         * @Step4: queue the transaction
         */
    }

    function execute() external {}
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
