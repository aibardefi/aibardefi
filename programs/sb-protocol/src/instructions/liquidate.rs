use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

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
        mut,
        seeds = [POSITION_SEED, position_owner.key().as_ref(), collateral_config.collateral_mint.as_ref()],
        bump = position.bump,
        constraint = position.active @ ErrorCode::PositionNotActive,
    )]
    pub position: Account<'info, Position>,

    /// CHECK: Position owner, validated by position PDA derivation. Used to return surplus collateral.
    pub position_owner: UncheckedAccount<'info>,

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
        constraint = liquidator_sb_ata.owner == liquidator.key(),
        constraint = liquidator_sb_ata.mint == protocol.sb_mint,
    )]
    pub liquidator_sb_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = liquidator_collateral_ata.owner == liquidator.key(),
        constraint = liquidator_collateral_ata.mint == collateral_config.collateral_mint,
    )]
    pub liquidator_collateral_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_collateral_ata.owner == position_owner.key(),
        constraint = owner_collateral_ata.mint == collateral_config.collateral_mint,
    )]
    pub owner_collateral_ata: Account<'info, TokenAccount>,

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

    pub token_program: Program<'info, Token>,
}

pub fn handle_liquidate(ctx: Context<Liquidate>) -> Result<()> {
    let clock = Clock::get()?;
    let position = &ctx.accounts.position;
    let config = &ctx.accounts.collateral_config;
    let collateral_price = &ctx.accounts.collateral_price_feed;
    let sb_price = &ctx.accounts.sb_price_feed;

    collateral_price.validate(clock.unix_timestamp)?;
    sb_price.validate(clock.unix_timestamp)?;

    let collateral_value = (position.collateral_amount as u128)
        .checked_mul(collateral_price.price as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(PRICE_DECIMALS as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let debt_value = (position.debt_amount as u128)
        .checked_mul(sb_price.price as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(PRICE_DECIMALS as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let current_ltv = debt_value
        .checked_mul(BPS_DENOMINATOR as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(collateral_value)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(
        current_ltv >= config.liquidation_threshold_bps as u128,
        ErrorCode::PositionNotLiquidatable
    );

    let debt_amount = position.debt_amount;
    let total_collateral = position.collateral_amount;

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.liquidator_sb_ata.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
                authority: ctx.accounts.liquidator.to_account_info(),
            },
        ),
        debt_amount,
    )?;

    let collateral_for_liquidator = (debt_value
        .checked_mul((BPS_DENOMINATOR + LIQUIDATION_INCENTIVE_BPS) as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_mul(PRICE_DECIMALS as u128)
        .ok_or(ErrorCode::MathOverflow)?)
    .checked_div(
        (collateral_price.price as u128)
            .checked_mul(BPS_DENOMINATOR as u128)
            .ok_or(ErrorCode::MathOverflow)?,
    )
    .ok_or(ErrorCode::MathOverflow)? as u64;

    let collateral_for_liquidator = collateral_for_liquidator.min(total_collateral);
    let surplus = total_collateral
        .checked_sub(collateral_for_liquidator)
        .ok_or(ErrorCode::MathOverflow)?;

    let bump = ctx.accounts.protocol.bump;
    let seeds: &[&[u8]] = &[PROTOCOL_SEED, &[bump]];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.collateral_vault.to_account_info(),
                to: ctx.accounts.liquidator_collateral_ata.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
            signer_seeds,
        ),
        collateral_for_liquidator,
    )?;

    if surplus > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.collateral_vault.to_account_info(),
                    to: ctx.accounts.owner_collateral_ata.to_account_info(),
                    authority: ctx.accounts.protocol.to_account_info(),
                },
                signer_seeds,
            ),
            surplus,
        )?;
    }

    let config = &mut ctx.accounts.collateral_config;
    config.total_deposited = config
        .total_deposited
        .checked_sub(total_collateral)
        .ok_or(ErrorCode::MathOverflow)?;
    config.total_debt = config
        .total_debt
        .checked_sub(debt_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    let protocol = &mut ctx.accounts.protocol;
    protocol.total_positions = protocol
        .total_positions
        .checked_sub(1)
        .ok_or(ErrorCode::MathOverflow)?;
    protocol.total_sb_borrowed = protocol
        .total_sb_borrowed
        .checked_sub(debt_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    let position = &mut ctx.accounts.position;
    position.active = false;
    position.collateral_amount = 0;
    position.debt_amount = 0;
    position.last_updated = clock.unix_timestamp;

    emit!(LiquidateEvent {
        liquidator: ctx.accounts.liquidator.key(),
        owner: ctx.accounts.position_owner.key(),
        collateral_mint: config.collateral_mint,
        debt_amount,
        collateral_seized: collateral_for_liquidator,
        surplus_returned: surplus,
    });

    Ok(())
}

#[event]
pub struct LiquidateEvent {
    pub liquidator: Pubkey,
    pub owner: Pubkey,
    pub collateral_mint: Pubkey,
    pub debt_amount: u64,
    pub collateral_seized: u64,
    pub surplus_returned: u64,
}
