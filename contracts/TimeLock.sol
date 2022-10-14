// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*
 * @description: TimeLock is a contract that publishes a transaction to be executed in the future. After a mimimum waiting period, the transaction can be executed.
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;
    mapping(bytes32 => bool) private _queuedTransactions;

    uint public constant MIN_DELAY = 10; // seconds
    uint public constant MAX_DELAY = 1000; // seconds
    uint public constant GRACE_PERIOD = 1000; // seconds

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
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) external onlyOwner {
        /**
         * @Step1: create a tx id using the target, value, function, data, and timestamp
         * @Step2: check if the tx id is in the queue i.e. unique
         * @Step3: check if the timestamp is in the future
         * @Step4: queue the transaction
         */
        bytes32 txId = computeTxId(_target, _value, _func, _data, _timestamp);
        require(
            !_queuedTransactions[txId],
            "TimeLock: transaction already queued"
        );
        // ---|------------|---------------|-------
        //  block    block + min     block + max
        //  number    wait time      wait time
        reqiure(
            _timestamp >= block.timestamp + MIN_DELAY &&
                _timestamp <= block.timestamp + MAX_DELAY,
            "TimeLock: timestamp out of range"
        );
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
