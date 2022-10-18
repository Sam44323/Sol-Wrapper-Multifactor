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

    // events for the contracts
    event RemoveLiquidity(address indexed provider, uint amount0, uint amount1);

    constructor(address _token0, address _token1) {
        // NOTE: This contract assumes that
        // token0 and token1 both have same decimals
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    /*
     * @description: utils function for minting shares for the liquidity-provider
     */

    function _mint(address _to, uint _amount) private {
        balanceOf[_to] += _amount;
        totalSupply += _amount;
    }

    /*
     * @description: utils function for burning shares for the liquidity-provider
     */

    function _burn(address _from, uint _amount) private {
        balanceOf[_from] -= _amount;
        totalSupply -= _amount;
    }

    /*
     * @description: utils function for updating the shares and the total_supply of the liquidity
     */

    function _update(uint _amount0, uint _amount1) private {
        reserve0 = _amount0;
        reserve1 = _amount1;
    }

    /*
     * @description: utils function for swapping tokenIn <> tokenOut in the liquidity
     */

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
        returns (uint shares)
    {
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);

        uint bal0 = token0.balanceOf(address(this));
        uint bal1 = token1.balanceOf(address(this));

        uint d0 = bal0 - reserve0;
        uint d1 = bal1 - reserve1;

        /*
        a = amount in
        L = total liquidity
        s = shares to mint
        T = total supply

        s should be proportional to increase from L to L + a
        (L + a) / L = (T + s) / T

        s = a * T / L
        */
        if (totalSupply > 0) {
            shares = ((d0 + d1) * totalSupply) / (reserve0 + reserve1);
        } else {
            shares = d0 + d1;
        }

        require(shares > 0, "shares = 0");
        _mint(msg.sender, shares);

        _update(bal0, bal1);
    }

    function removeLiquidity(uint _shares) external returns (uint d0, uint d1) {
        /*
        a = amount out
        L = total liquidity
        s = shares
        T = total supply

        a / L = s / T

        a = L * s / T
          = (reserve0 + reserve1) * s / T
        */
        d0 = (reserve0 * _shares) / totalSupply;
        d1 = (reserve1 * _shares) / totalSupply;

        _burn(msg.sender, _shares);
        _update(reserve0 - d0, reserve1 - d1);

        if (d0 > 0) {
            token0.transfer(msg.sender, d0);
        }
        if (d1 > 0) {
            token1.transfer(msg.sender, d1);
        }

        emit RemoveLiquidity(msg.sender, d0, d1);
    }
}
