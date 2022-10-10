// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;
}

contract Dutchauction is IERC721 {
    // contract based variables
    uint private constant DURATION = 7 days;
    uint public immutable startTime;
    uint public immutable endTime;
    uint public immutable startingPrice;
    uint public immutable discountRate;

    // nft based variables
    IERC721 public immutable nft;
    uint public immutable nftId;

    // seller based variables
    address public immutable seller;

    constructor(
        address _nft,
        uint _nftId,
        uint _startingPrice,
        uint _discountRate,
        uint _startTime
    ) {
        require(_discountRate < 100, "Discount rate must be less than 100%");
        discountRate = _discountRate;
        require(
            _startingPrice >= discountRate * DURATION,
            "Starting price too low"
        );
        require(
            _startTime >= block.timestamp,
            "Start time must be in the future!"
        );
        nft = IERC721(_nft);
        nftId = _nftId;
        startingPrice = _startingPrice;
        startTime = _startTime;
        endTime = _startTime + DURATION;
        seller = msg.sender;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external override {
        // do something
    }
}
