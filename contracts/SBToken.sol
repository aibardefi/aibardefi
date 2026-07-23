// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SBToken is ERC20 {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;

    constructor(address treasury) ERC20("SB Token", "SB") {
        _mint(treasury, TOTAL_SUPPLY);
    }
}
