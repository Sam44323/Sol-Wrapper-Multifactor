// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;
}

contract Dutchauction is Ownable {
    // contract based variables
    uint private constant DURATION = 7 days;
    uint public immutable startTime;
    uint public immutable endTime;
    uint public immutable startingPrice;
    uint public immutable discountRate;
    bool private auctionActive;
    address private _owner;

    // nft based variables
    IERC721 public immutable nft;
    uint private nftId;

    // seller based variables
    address payable public immutable seller;

    constructor(
        address _nft,
        uint _startingPrice,
        uint _discountRate
    ) {
        require(_discountRate < 100, "Discount rate must be less than 100%");
        discountRate = _discountRate;
        require(
            _startingPrice >= discountRate * DURATION,
            "Starting price too low"
        );
        nft = IERC721(_nft);
        startingPrice = _startingPrice;
        startTime = block.timestamp;
        endTime = startTime + DURATION;
        seller = payable(msg.sender);
        _owner = msg.sender;
    }

    function startAuction(uint _nftId) external {
        nftId = _nftId;
        nft.transferFrom(msg.sender, address(this), _nftId);
        auctionActive = true;
    }

    function getAuctionedTokenId() external view returns (uint) {
        return nftId;
    }

    function getListingPrice() internal view returns (uint) {
        if (block.timestamp < startTime) {
            return startingPrice;
        } else if (block.timestamp >= endTime) {
            return 0;
        } else {
            uint elapsedTime = block.timestamp - startTime; // this means that price will be decrease as the auction goes on
            uint discount = (elapsedTime * discountRate) / DURATION;
            return startingPrice - discount;
        }
    }

    function buy() external payable isActive {
        require(block.timestamp >= startTime, "Auction not started yet!");
        require(block.timestamp <= endTime, "Auction already ended!");
        uint price = getListingPrice();
        require(msg.value >= price, "Not enough funds sent!");
        uint refundPrice = msg.value - price;
        nft.transferFrom(address(this), msg.sender, nftId);
        nftId = 0;
        if (refundPrice > 0) payable(msg.sender).transfer(refundPrice);
        seller.transfer(msg.value);
        endAuction();
    }

    function endAuction() public isActive {
        auctionActive = false;
        if (nftId > 0) nft.transferFrom(address(this), seller, nftId);
        selfdestruct(seller); // sending all the contract's balance to the seller (if any) and destroy the contract
    }

    modifier isActive() {
        require(auctionActive == true, "Auction is not active");
        _;
    }

    modifier isOwner() {
        require(msg.sender == seller, "You are not the owner of this contract");
        _;
    }
}
