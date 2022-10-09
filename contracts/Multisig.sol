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
        for (uint i = 0; i < owners.length; i++) {
            require(!isOwner[_owners[i]], "owner not unique!");
            require(_owners[i] != address(0), "invalid owner!");
            isOwner[owners[i]] = true;
        }
        owners = _owners;
        txApprovalRequired = _txApprovalRequired;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }
}
