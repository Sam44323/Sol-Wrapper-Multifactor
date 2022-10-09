// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @dev enhancement can be create a new wallet address on by the contract

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
    uint256 nonce;
    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
    }
    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approvals;

    // called on creation of a new wallet with the owners
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

    function _getApprovalCount(uint _txId)
        private
        view
        onlyOwner
        returns (uint count)
    {
        for (uint i = 0; i < owners.length; i++) {
            if (approvals[_txId][owners[i]]) {
                count += 1;
            }
        }
        return count;
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

    function approveTransaction(uint _txId)
        external
        onlyOwner
        transactionExists(_txId)
        notApproved(_txId)
        notExecuted(_txId)
    {
        require(
            transactions[_txId].executed == false,
            "transaction already executed!"
        );
        require(
            approvals[_txId][msg.sender] == false,
            "transaction already approved!"
        );
        approvals[_txId][msg.sender] = true;
        emit ApproveTransaction(msg.sender, _txId);
    }

    function revokeApproval(uint _txId)
        external
        onlyOwner
        transactionExists(_txId)
        approved(_txId)
        notExecuted(_txId)
    {
        require(
            transactions[_txId].executed == false,
            "transaction already executed!"
        );
        require(
            approvals[_txId][msg.sender] == true,
            "transaction not approved!"
        );
        approvals[_txId][msg.sender] = false;
        emit RevokeTransaction(msg.sender, _txId);
    }

    function executeTransaction(uint _txId, uint _nonce)
        external
        onlyOwner
        transactionExists(_txId)
        notExecuted(_txId)
    {
        require(
            _getApprovalCount(_txId) >= txApprovalRequired,
            "not enough approvals!"
        );
        require(nonce > _nonce, "invalid nonce!");
        Transaction storage transaction = transactions[_txId];
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "transaction failed!");
        emit ExecuteTransaction(msg.sender, _txId);
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier transactionExists(uint _txId) {
        require(_txId < transactions.length, "transactiontx does not exist!");
        _;
    }

    modifier approved(uint _txId) {
        require(approvals[_txId][msg.sender], "transaction not approved!");
        _;
    }

    modifier notApproved(uint _txId) {
        require(
            approvals[_txId][msg.sender] == false,
            "transaction already approved!"
        );
        _;
    }

    modifier notExecuted(uint _txId) {
        require(
            transactions[_txId].executed == false,
            "transaction already executed!"
        );
        _;
    }
}
