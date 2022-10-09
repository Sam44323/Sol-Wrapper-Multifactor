// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Multisig {
    // events for the wallet
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );
    event ApproveTransaction(address indexed owner, uint indexed txIndex);
    event RevokeTransaction(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    // variables for the wallet
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public txApprovalRequired;
    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approvals;

    constructor(address[] memory _owners, uint _txApprovalRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _txApprovalRequired > 0 && _txApprovalRequired <= _owners.length,
            "invalid tx approval owners!"
        );

        // pushing the owners to the array
        for (uint i = 0; i < owners.length; i++) {
            require(!isOwner[_owners[i]], "owner not unique!");
            require(_owners[i] != address(0), "invalid owner!");
            isOwner[owners[i]] = true;
            owners.push(_owners[i]);
        }
        txApprovalRequired = _txApprovalRequired; // setting the tx-required variable
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint _amount,
        bytes calldata _data
    ) external onlyOwner {
        uint txIndex = transactions.length;
        transactions.push(
            Transaction({to: _to, value: _amount, data: _data, executed: false})
        );
        emit SubmitTransaction(msg.sender, txIndex, _to, _amount, _data);
    }

    function approveTranaction(uint _txId) external onlyOwner {
        require(transactions[_txId].executed == false, "tx already executed!");
        require(approvals[_txId][msg.sender] == false, "tx already approved!");
        approvals[_txId][msg.sender] = true;
        emit ApproveTransaction(msg.sender, _txId);
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }
}
