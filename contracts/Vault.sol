// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./utils/IERC20.sol";

contract Vault {
    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }
}
