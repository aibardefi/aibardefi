// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    mapping(address => uint256) public prices;
    mapping(address => uint256) public updatedAt;

    uint256 public constant PRICE_DECIMALS = 1e8;
    uint256 public constant STALE_THRESHOLD = 1 hours;

    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    function setPrice(address token, uint256 price) external onlyOwner {
        require(price > 0, "Invalid price");
        prices[token] = price;
        updatedAt[token] = block.timestamp;
        emit PriceUpdated(token, price, block.timestamp);
    }

    function setBatchPrices(
        address[] calldata tokens,
        uint256[] calldata _prices
    ) external onlyOwner {
        require(tokens.length == _prices.length, "Length mismatch");
        for (uint256 i = 0; i < tokens.length; i++) {
            require(_prices[i] > 0, "Invalid price");
            prices[tokens[i]] = _prices[i];
            updatedAt[tokens[i]] = block.timestamp;
            emit PriceUpdated(tokens[i], _prices[i], block.timestamp);
        }
    }

    function getPrice(address token) external view returns (uint256 price, uint256 timestamp) {
        price = prices[token];
        timestamp = updatedAt[token];
        require(price > 0, "Price not set");
        require(block.timestamp - timestamp <= STALE_THRESHOLD, "Stale price");
    }
}
