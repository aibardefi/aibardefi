use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct RepayPosition<'info> {
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
        mut,
        seeds = [POSITION_SEED, owner.key().as_ref(), collateral_config.collateral_mint.as_ref()],
        bump = position.bump,
        constraint = position.owner == owner.key(),
        constraint = position.active @ ErrorCode::PositionNotActive,
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

    pub token_program: Program<'info, Token>,
}

pub fn handle_repay_position(ctx: Context<RepayPosition>) -> Result<()> {
    let position = &ctx.accounts.position;
    require!(position.debt_amount > 0, ErrorCode::NothingToRepay);

    let debt_amount = position.debt_amount;
    let collateral_amount = position.collateral_amount;

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_sb_ata.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        debt_amount,
    )?;

    let bump = ctx.accounts.protocol.bump;
    let seeds: &[&[u8]] = &[PROTOCOL_SEED, &[bump]];
    let signer_seeds = &[seeds];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.collateral_vault.to_account_info(),
                to: ctx.accounts.user_collateral_ata.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
            signer_seeds,
        ),
        collateral_amount,
    )?;

    let config = &mut ctx.accounts.collateral_config;
    config.total_deposited = config
        .total_deposited
        .checked_sub(collateral_amount)
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
    position.last_updated = Clock::get()?.unix_timestamp;

    emit!(RepayPositionEvent {
        owner: ctx.accounts.owner.key(),
        collateral_mint: config.collateral_mint,
        debt_repaid: debt_amount,
        collateral_returned: collateral_amount,
    });

    Ok(())
}

#[event]
pub struct RepayPositionEvent {
    pub owner: Pubkey,
    pub collateral_mint: Pubkey,
    pub debt_repaid: u64,
    pub collateral_returned: u64,
}
