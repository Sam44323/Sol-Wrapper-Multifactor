pragma solidity ^0.8.9;

contract Escrow{
  address public escrowOwner; // deployer of the contract

  constructor(){
    escrowOwner = msg.sender;
  }
  // receive native contract for funds
  receive() external payable{
  }

  // withdraw function (admin-only and destructible post withdraw)
  function withdraw() external onlyOwner {
    selfdestruct(payable(escrowOwner)); // destruct the contract and send funds to owner
  }

  modifier onlyOwner(){
    require(msg.sender == escrowOwner, "Only the owner can call this function");
    _;
  }
}