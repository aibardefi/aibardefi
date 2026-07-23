use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol.bump,
    )]
    pub protocol: Account<'info, Protocol>,

    #[account(
        mut,
        seeds = [COLLATERAL_CONFIG_SEED, collateral_config.collateral_mint.as_ref()],
        bump = collateral_config.bump,
    )]
    pub collateral_config: Account<'info, CollateralConfig>,

    #[account(
        init,
        payer = owner,
        space = Position::SIZE,
        seeds = [POSITION_SEED, owner.key().as_ref(), collateral_config.collateral_mint.as_ref()],
        bump,
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        seeds = [COLLATERAL_VAULT_SEED, collateral_config.collateral_mint.as_ref()],
        bump,
        constraint = collateral_vault.key() == collateral_config.collateral_vault,
    )]
    pub collateral_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [TREASURY_VAULT_SEED, protocol.key().as_ref()],
        bump,
        constraint = treasury_vault.key() == protocol.treasury_vault,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_collateral_ata.owner == owner.key(),
        constraint = user_collateral_ata.mint == collateral_config.collateral_mint,
    )]
    pub user_collateral_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_sb_ata.owner == owner.key(),
        constraint = user_sb_ata.mint == protocol.sb_mint,
    )]
    pub user_sb_ata: Account<'info, TokenAccount>,

    #[account(
        seeds = [PRICE_FEED_SEED, collateral_config.collateral_mint.as_ref()],
        bump = collateral_price_feed.bump,
        constraint = collateral_price_feed.asset_mint == collateral_config.collateral_mint,
    )]
    pub collateral_price_feed: Account<'info, PriceFeed>,

    #[account(
        seeds = [PRICE_FEED_SEED, protocol.sb_mint.as_ref()],
        bump = sb_price_feed.bump,
        constraint = sb_price_feed.asset_mint == protocol.sb_mint,
    )]
    pub sb_price_feed: Account<'info, PriceFeed>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_open_position(ctx: Context<OpenPosition>, collateral_amount: u64, sb_amount: u64) -> Result<()> {
    let protocol = &ctx.accounts.protocol;
    let config = &ctx.accounts.collateral_config;
    let clock = Clock::get()?;

    require!(!protocol.paused, ErrorCode::ProtocolPaused);
    require!(config.active, ErrorCode::CollateralNotActive);

    ctx.accounts.collateral_price_feed.validate(clock.unix_timestamp)?;
    ctx.accounts.sb_price_feed.validate(clock.unix_timestamp)?;

    let collateral_value = (collateral_amount as u128)
        .checked_mul(ctx.accounts.collateral_price_feed.price as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(PRICE_DECIMALS as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let sb_value = (sb_amount as u128)
        .checked_mul(ctx.accounts.sb_price_feed.price as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(PRICE_DECIMALS as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let ltv = sb_value
        .checked_mul(BPS_DENOMINATOR as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(collateral_value)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(
        ltv <= config.max_initial_ltv_bps as u128,
        ErrorCode::ExceedsMaxLtv
    );
    require!(
        collateral_amount >= config.min_position_size,
        ErrorCode::PositionTooSmall
    );
    require!(
        collateral_amount <= config.max_position_size,
        ErrorCode::PositionTooLarge
    );

    let new_total_debt = config
        .total_debt
        .checked_add(sb_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    require!(
        new_total_debt <= config.debt_ceiling,
        ErrorCode::ExceedsDebtCeiling
    );

    let treasury_balance = ctx.accounts.treasury_vault.amount;
    let max_lendable = (treasury_balance as u128)
        .checked_mul(protocol.utilization_cap_bps as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    let min_reserve = (treasury_balance as u128)
        .checked_mul(protocol.treasury_reserve_bps as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    require!(sb_amount <= max_lendable, ErrorCode::UtilizationCapExceeded);
    require!(
        treasury_balance.checked_sub(sb_amount).ok_or(ErrorCode::MathOverflow)? >= min_reserve,
        ErrorCode::InsufficientTreasuryBalance
    );

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_collateral_ata.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        collateral_amount,
    )?;

    let bump = ctx.accounts.protocol.bump;
    let seeds: &[&[u8]] = &[PROTOCOL_SEED, &[bump]];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.treasury_vault.to_account_info(),
                to: ctx.accounts.user_sb_ata.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
            signer_seeds,
        ),
        sb_amount,
    )?;

    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.owner.key();
    position.collateral_mint = ctx.accounts.collateral_config.collateral_mint;
    position.collateral_amount = collateral_amount;
    position.debt_amount = sb_amount;
    position.opened_at = clock.unix_timestamp;
    position.last_updated = clock.unix_timestamp;
    position.active = true;
    position.bump = ctx.bumps.position;

    let config = &mut ctx.accounts.collateral_config;
    config.total_deposited = config
        .total_deposited
        .checked_add(collateral_amount)
        .ok_or(ErrorCode::MathOverflow)?;
    config.total_debt = new_total_debt;

    let protocol = &mut ctx.accounts.protocol;
    protocol.total_positions = protocol
        .total_positions
        .checked_add(1)
        .ok_or(ErrorCode::MathOverflow)?;
    protocol.total_sb_borrowed = protocol
        .total_sb_borrowed
        .checked_add(sb_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    emit!(OpenPositionEvent {
        owner: ctx.accounts.owner.key(),
        collateral_mint: ctx.accounts.collateral_config.collateral_mint,
        collateral_amount,
        debt_amount: sb_amount,
        ltv_bps: ltv as u16,
    });

    Ok(())
}

#[event]
pub struct OpenPositionEvent {
    pub owner: Pubkey,
    pub collateral_mint: Pubkey,
    pub collateral_amount: u64,
    pub debt_amount: u64,
    pub ltv_bps: u16,
}
