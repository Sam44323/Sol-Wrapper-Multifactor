// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Escrow {
    address public escrowOwner; // deployer of the contract
    mapping(address => uint) public deposits; // deposits of each user

    event Deposit(address from, uint amount);
    event Withdraw(address from, uint amount);

    constructor() {
        escrowOwner = msg.sender;
    }

    // receive native contract for funds (default)
    receive() external payable {
        emit Withdraw(msg.sender, address(this).balance);
        deposits[msg.sender] += msg.value;
    }

    // fetching the balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // withdraw function (admin-only and destructible[allocation_0] post withdraw)
    function withdraw() external onlyOwner {
        emit Withdraw(escrowOwner, address(this).balance);
        selfdestruct(payable(escrowOwner)); // destruct the contract and send funds to owner
    }

    modifier onlyOwner() {
        require(
            msg.sender == escrowOwner,
            "Only the owner can call this function"
        );
        _;
    }
}
