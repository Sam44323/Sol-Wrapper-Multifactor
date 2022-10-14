// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/*
 * @description: TimeLock is a contract that publishes a transaction to be executed in the future. After a mimimum waiting period, the transaction can be executed.
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeLock is Ownable {
    address private _owner;
    mapping(bytes32 => bool) private _queuedTransactions;

    uint public constant MIN_DELAY = 10 seconds; // typically will be days/weeks
    uint public constant MAX_DELAY = 1000 seconds; // typically will be days/weeks
    uint public constant GRACE_PERIOD = 1000 seconds; // typically will be days/weeks

    // custom errors
    error TimestampNotInRangeError(uint blockTimestamp, uint timestamp);
    error TimestampNotPassedError(uint blockTimestmap, uint timestamp);
    error TimestampExpiredError(uint blockTimestamp, uint expiresAt);
    error TxFailedError();

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

    receive() external payable {}

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
        if (
            _timestamp < block.timestamp + MIN_DELAY ||
            _timestamp > block.timestamp + MAX_DELAY
        ) {
            revert TimestampNotInRangeError(block.timestamp, _timestamp);
        }
        _queuedTransactions[txId] = true;

        emit Queue(txId, _target, _value, _func, _data, _timestamp);
    }

    function execute(
        address _target,
        uint _value,
        string calldata _func,
        bytes calldata _data,
        uint _timestamp
    ) external payable onlyOwner returns (bytes memory) {
        bytes32 txId = computeTxId(_target, _value, _func, _data, _timestamp);
        require(_queuedTransactions[txId], "TimeLock: transaction not queued");

        if (block.timestamp < _timestamp) {
            revert TimestampNotPassedError(block.timestamp, _timestamp);
        }
        if (block.timestamp > _timestamp + GRACE_PERIOD) {
            revert TimestampExpiredError(
                block.timestamp,
                _timestamp + GRACE_PERIOD
            );
        }

        // prepare data
        bytes memory data;
        if (bytes(_func).length > 0) {
            // data = func selector + _data
            data = abi.encodePacked(bytes4(keccak256(bytes(_func))), _data);
        } else {
            // call fallback with data
            data = _data;
        }

        // call target
        (bool ok, bytes memory res) = _target.call{value: _value}(data);
        if (!ok) {
            revert TxFailedError();
        }

        emit Execute(txId, _target, _value, _func, _data, _timestamp);

        return res;
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
