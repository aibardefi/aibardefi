// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256 price, uint256 timestamp);
    function PRICE_DECIMALS() external view returns (uint256);
}

contract CollateralVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable sbToken;
    IPriceOracle public oracle;
    address public treasury;

    uint256 public constant MAX_LTV = 8000;           // 80.00%
    uint256 public constant LIQUIDATION_THRESHOLD = 9000; // 90.00%
    uint256 public constant BPS = 10000;
    uint256 public constant LIQUIDATION_PENALTY = 500;    // 5%

    struct Position {
        address owner;
        address collateralToken;
        uint256 collateralAmount;
        uint256 debtAmount;        // SB owed
        uint256 openedAt;
        bool active;
    }

    uint256 public nextPositionId;
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    mapping(address => bool) public allowedCollateral;

    uint256 public totalCollateralValue;
    uint256 public totalDebtIssued;

    event CollateralAdded(address indexed token, uint256 maxLtv);
    event CollateralRemoved(address indexed token);
    event PositionOpened(uint256 indexed id, address indexed owner, address token, uint256 collateral, uint256 debt);
    event PositionClosed(uint256 indexed id, address indexed owner);
    event PositionLiquidated(uint256 indexed id, address indexed liquidator, uint256 collateralSeized, uint256 debtRepaid);
    event OracleUpdated(address indexed newOracle);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(address _sbToken, address _oracle, address _treasury) Ownable(msg.sender) {
        sbToken = IERC20(_sbToken);
        oracle = IPriceOracle(_oracle);
        treasury = _treasury;
    }

    function addCollateralToken(address token) external onlyOwner {
        allowedCollateral[token] = true;
        emit CollateralAdded(token, MAX_LTV);
    }

    function removeCollateralToken(address token) external onlyOwner {
        allowedCollateral[token] = false;
        emit CollateralRemoved(token);
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = IPriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function lockAndBorrow(
        address collateralToken,
        uint256 collateralAmount,
        uint256 sbAmount
    ) external nonReentrant returns (uint256 positionId) {
        require(allowedCollateral[collateralToken], "Token not allowed");
        require(collateralAmount > 0, "Zero collateral");
        require(sbAmount > 0, "Zero borrow");

        uint256 collateralValue = _getTokenValue(collateralToken, collateralAmount);
        uint256 sbValue = _getSbValue(sbAmount);
        uint256 ltv = (sbValue * BPS) / collateralValue;
        require(ltv <= MAX_LTV, "LTV too high");

        require(sbToken.balanceOf(treasury) >= sbAmount, "Treasury insufficient");

        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);
        sbToken.safeTransferFrom(treasury, msg.sender, sbAmount);

        positionId = nextPositionId++;
        positions[positionId] = Position({
            owner: msg.sender,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            debtAmount: sbAmount,
            openedAt: block.timestamp,
            active: true
        });
        userPositions[msg.sender].push(positionId);

        totalDebtIssued += sbAmount;

        emit PositionOpened(positionId, msg.sender, collateralToken, collateralAmount, sbAmount);
    }

    function repayAndUnlock(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.active, "Position not active");
        require(pos.owner == msg.sender, "Not position owner");

        uint256 debt = pos.debtAmount;
        address collateralToken = pos.collateralToken;
        uint256 collateralAmount = pos.collateralAmount;

        sbToken.safeTransferFrom(msg.sender, treasury, debt);
        IERC20(collateralToken).safeTransfer(msg.sender, collateralAmount);

        pos.active = false;
        pos.debtAmount = 0;
        pos.collateralAmount = 0;
        totalDebtIssued -= debt;

        emit PositionClosed(positionId, msg.sender);
    }

    function liquidate(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.active, "Position not active");

        uint256 currentLtv = getPositionLtv(positionId);
        require(currentLtv >= LIQUIDATION_THRESHOLD, "Position healthy");

        uint256 debt = pos.debtAmount;
        uint256 collateralAmount = pos.collateralAmount;
        address collateralToken = pos.collateralToken;

        uint256 penalty = (collateralAmount * LIQUIDATION_PENALTY) / BPS;
        uint256 returnToOwner = collateralAmount - penalty;

        sbToken.safeTransferFrom(msg.sender, treasury, debt);

        IERC20(collateralToken).safeTransfer(msg.sender, penalty);
        if (returnToOwner > 0) {
            IERC20(collateralToken).safeTransfer(pos.owner, returnToOwner);
        }

        pos.active = false;
        pos.debtAmount = 0;
        pos.collateralAmount = 0;
        totalDebtIssued -= debt;

        emit PositionLiquidated(positionId, msg.sender, penalty, debt);
    }

    function getPositionLtv(uint256 positionId) public view returns (uint256) {
        Position storage pos = positions[positionId];
        if (!pos.active || pos.collateralAmount == 0) return 0;

        uint256 collateralValue = _getTokenValue(pos.collateralToken, pos.collateralAmount);
        uint256 sbValue = _getSbValue(pos.debtAmount);
        return (sbValue * BPS) / collateralValue;
    }

    function getPositionDetails(uint256 positionId) external view returns (
        address owner,
        address collateralToken,
        uint256 collateralAmount,
        uint256 debtAmount,
        uint256 ltv,
        uint256 openedAt,
        bool active
    ) {
        Position storage pos = positions[positionId];
        return (
            pos.owner,
            pos.collateralToken,
            pos.collateralAmount,
            pos.debtAmount,
            getPositionLtv(positionId),
            pos.openedAt,
            pos.active
        );
    }

    function getUserPositionIds(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getTreasuryBalance() external view returns (uint256) {
        return sbToken.balanceOf(treasury);
    }

    function _getTokenValue(address token, uint256 amount) internal view returns (uint256) {
        (uint256 price, ) = oracle.getPrice(token);
        uint256 decimals = oracle.PRICE_DECIMALS();
        return (amount * price) / decimals;
    }

    function _getSbValue(uint256 amount) internal view returns (uint256) {
        (uint256 price, ) = oracle.getPrice(address(sbToken));
        uint256 decimals = oracle.PRICE_DECIMALS();
        return (amount * price) / decimals;
    }
}
