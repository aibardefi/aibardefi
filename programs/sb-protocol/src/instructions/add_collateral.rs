use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct AddCollateral<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol.bump,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub protocol: Account<'info, Protocol>,

    pub collateral_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = CollateralConfig::SIZE,
        seeds = [COLLATERAL_CONFIG_SEED, collateral_mint.key().as_ref()],
        bump,
    )]
    pub collateral_config: Account<'info, CollateralConfig>,

    #[account(
        init,
        payer = authority,
        token::mint = collateral_mint,
        token::authority = protocol,
        seeds = [COLLATERAL_VAULT_SEED, collateral_mint.key().as_ref()],
        bump,
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = PriceFeed::SIZE,
        seeds = [PRICE_FEED_SEED, collateral_mint.key().as_ref()],
        bump,
    )]
    pub price_feed: Account<'info, PriceFeed>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<AddCollateral>,
    max_initial_ltv_bps: u16,
    liquidation_threshold_bps: u16,
    debt_ceiling: u64,
    max_position_size: u64,
    min_position_size: u64,
) -> Result<()> {
    require!(
        max_initial_ltv_bps < liquidation_threshold_bps,
        ErrorCode::LtvTooHigh
    );
    require!(
        (liquidation_threshold_bps as u64) <= BPS_DENOMINATOR,
        ErrorCode::InvalidParameter
    );
    require!(
        (max_initial_ltv_bps as u64) <= BPS_DENOMINATOR,
        ErrorCode::InvalidParameter
    );

    let config = &mut ctx.accounts.collateral_config;
    config.collateral_mint = ctx.accounts.collateral_mint.key();
    config.collateral_vault = ctx.accounts.collateral_vault.key();
    config.max_initial_ltv_bps = max_initial_ltv_bps;
    config.liquidation_threshold_bps = liquidation_threshold_bps;
    config.debt_ceiling = debt_ceiling;
    config.max_position_size = max_position_size;
    config.min_position_size = min_position_size;
    config.total_deposited = 0;
    config.total_debt = 0;
    config.active = true;
    config.bump = ctx.bumps.collateral_config;

    let feed = &mut ctx.accounts.price_feed;
    feed.asset_mint = ctx.accounts.collateral_mint.key();
    feed.price = 0;
    feed.twap_price = 0;
    feed.last_update = 0;
    feed.oracle_authority = ctx.accounts.authority.key();
    feed.confidence = 0;
    feed.max_deviation_bps = 500;
    feed.min_update_interval = 30;
    feed.bump = ctx.bumps.price_feed;

    emit!(AddCollateralEvent {
        collateral_mint: ctx.accounts.collateral_mint.key(),
        max_initial_ltv_bps,
        liquidation_threshold_bps,
    });

    Ok(())
}

#[event]
pub struct AddCollateralEvent {
    pub collateral_mint: Pubkey,
    pub max_initial_ltv_bps: u16,
    pub liquidation_threshold_bps: u16,
}
