// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/IERC20.sol";

contract CSAMM {
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    constructor(address _token0, address _token1) {
        // NOTE: This contract assumes that
        // token0 and token1 both have same decimals
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }
}
