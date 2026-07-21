use anchor_lang::prelude::*;

#[error_code]
pub enum OrderbookError {
    #[msg("Invalid leverage: must be between 1 and max leverage")]
    InvalidLeverage,
    #[msg("Order size below minimum")]
    OrderTooSmall,
    #[msg("Price must be aligned to tick size")]
    InvalidTickSize,
    #[msg("Insufficient margin for this order")]
    InsufficientMargin,
    #[msg("Order not found")]
    OrderNotFound,
    #[msg("Unauthorized: not the order owner")]
    Unauthorized,
    #[msg("Market is full, cannot place more orders")]
    MarketFull,
    #[msg("Insufficient balance for withdrawal")]
    InsufficientBalance,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Market already initialized")]
    MarketAlreadyInitialized,
    #[msg("No orders to match")]
    NoMatchableOrders,
}
