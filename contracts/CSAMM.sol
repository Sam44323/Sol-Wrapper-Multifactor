// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./utils/IERC20.sol";

contract CSAMM {
    IERC20 public immutable token0; // address for token0
    IERC20 public immutable token1; // address for token1

    uint public reserve0; // reseve value for token0
    uint public reserve1; // reseve value for token1

    uint public totalSupply; // value for the total supply of shares
    mapping(address => uint) public balanceOf; // share balance of each liquidity-providers

    constructor(address _token0, address _token1) {
        // NOTE: This contract assumes that
        // token0 and token1 both have same decimals
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    function _update(uint _amount0, uint _amount1) private {
        reserve0 = _amount0;
        reserve1 = _amount1;
    }

    function swap(address _tokenIn, uint _amountIn)
        external
        returns (uint amountOut)
    {
        require(
            _tokenIn == address(token0) || _tokenIn == address(token1),
            "Invalid tokenIn"
        );
        /**
         * TODO: Implement the swap function
         * 1. Check if _tokenIn is token0 or token1
         * 2. Calculate the amountOut
         * 3. Transfer the tokenIn to this contract
         * 4. Transfer the tokenOut from this contract
         * 5. Update the reserve0 and reserve1
         * 6. Return the amountOut
         */

        // 1. Check if _tokenIn is token0 or token1
        bool isToken0 = _tokenIn == address(token0);
        (IERC20 tokenIn, IERC20 tokenOut, uint resIn, uint resOut) = isToken0
            ? (token0, token1, reserve0, reserve1)
            : (token1, token0, reserve1, reserve0);

        // 2. Calculate the amountIn
        _amountIn = tokenIn.balanceOf(address(this)) - resIn;

        //0.03% fee
        // this-means amount out will be 99.7% of what amount came in
        // as we are taking 0.3% as fee
        amountOut = (_amountIn * 997) / 1000;

        (uint res0, uint res1) = isToken0
            ? (resIn + _amountIn, resOut - amountOut)
            : (resOut - amountOut, resIn + _amountIn);

        _update(res0, res1);
        tokenOut.transfer(msg.sender, amountOut);
    }

    function addLiquidity(uint _amount0, uint _amount1)
        external
        returns (uint _shares)
    {}

    function removeLiquidity(uint _shares)
        external
        returns (uint _amount0, uint _amount1)
    {}
}
