// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/IERC20.sol";

contract CPAMM {
    IERC20 public immutable token0; // address for token0
    IERC20 public immutable token1; // address for token1

    uint public reserve0; // reseve value for token0
    uint public reserve1; // reseve value for token1

    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token0, address _token1) {
        // NOTE: This contract assumes that
        // token0 and token1 both have same decimals
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function _mint(address _to, uint _amount) private {}

    function _burn(address _from, uint _amount) private {}

    function _update(uint _amount0, uint _amount1) private {}

    function swap(address _tokenIn, address _tokenOut)
        external
        returns (uint amountOut)
    {}

    function addLiquidity(uint _amount0, uint _amount1)
        external
        returns (uint _shares)
    {}

    function removeLiquidity(uint _shares)
        external
        returns (uint _amount0, uint _amount1)
    {}
}
