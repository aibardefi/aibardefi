use anchor_lang::prelude::*;

pub const PROTOCOL_SEED: &[u8] = b"protocol";
pub const COLLATERAL_CONFIG_SEED: &[u8] = b"collateral";
pub const POSITION_SEED: &[u8] = b"position";
pub const TREASURY_VAULT_SEED: &[u8] = b"treasury";
pub const COLLATERAL_VAULT_SEED: &[u8] = b"col_vault";
pub const PRICE_FEED_SEED: &[u8] = b"price_feed";
pub const BPS_DENOMINATOR: u64 = 10_000;
pub const PRICE_DECIMALS: u64 = 1_000_000;
pub const SB_TOTAL_SUPPLY: u64 = 1_000_000_000_000_000;
pub const SB_DECIMALS: u8 = 6;
pub const LIQUIDATION_INCENTIVE_BPS: u64 = 500;
pub const PRICE_STALENESS_THRESHOLD: i64 = 120;

#[account]
pub struct Protocol {
    pub authority: Pubkey,
    pub sb_mint: Pubkey,
    pub treasury_vault: Pubkey,
    pub paused: bool,
    pub total_positions: u64,
    pub total_sb_borrowed: u64,
    pub utilization_cap_bps: u16,
    pub treasury_reserve_bps: u16,
    pub bump: u8,
}

impl Protocol {
    pub const SIZE: usize = 8 + 32 + 32 + 32 + 1 + 8 + 8 + 2 + 2 + 1;
}

#[account]
pub struct CollateralConfig {
    pub collateral_mint: Pubkey,
    pub collateral_vault: Pubkey,
    pub max_initial_ltv_bps: u16,
    pub liquidation_threshold_bps: u16,
    pub debt_ceiling: u64,
    pub max_position_size: u64,
    pub min_position_size: u64,
    pub total_deposited: u64,
    pub total_debt: u64,
    pub active: bool,
    pub bump: u8,
}

impl CollateralConfig {
    pub const SIZE: usize = 8 + 32 + 32 + 2 + 2 + 8 + 8 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub debt_amount: u64,
    pub opened_at: i64,
    pub last_updated: i64,
    pub active: bool,
    pub bump: u8,
}

impl Position {
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct PriceFeed {
    pub asset_mint: Pubkey,
    pub price: u64,
    pub twap_price: u64,
    pub last_update: i64,
    pub oracle_authority: Pubkey,
    pub confidence: u64,
    pub max_deviation_bps: u16,
    pub min_update_interval: i64,
    pub bump: u8,
}

impl PriceFeed {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 8 + 32 + 8 + 2 + 8 + 1;
}
