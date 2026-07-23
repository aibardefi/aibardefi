use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Position exceeds maximum initial LTV")]
    ExceedsMaxLtv,
    #[msg("Position size below minimum")]
    PositionTooSmall,
    #[msg("Position size exceeds maximum")]
    PositionTooLarge,
    #[msg("Collateral debt ceiling exceeded")]
    ExceedsDebtCeiling,
    #[msg("Insufficient SB balance in treasury")]
    InsufficientTreasuryBalance,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Position is not liquidatable")]
    PositionNotLiquidatable,
    #[msg("Position is not active")]
    PositionNotActive,
    #[msg("Collateral type is not active")]
    CollateralNotActive,
    #[msg("Price feed is stale")]
    PriceStale,
    #[msg("Price deviation exceeds threshold")]
    PriceDeviationTooHigh,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Utilization cap exceeded")]
    UtilizationCapExceeded,
    #[msg("Invalid parameter")]
    InvalidParameter,
    #[msg("Position is already active")]
    PositionAlreadyActive,
    #[msg("Nothing to repay")]
    NothingToRepay,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Liquidation threshold must exceed max initial LTV")]
    LtvTooHigh,
}
