use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct TopUpPosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
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
        constraint = user_collateral_ata.owner == owner.key(),
        constraint = user_collateral_ata.mint == collateral_config.collateral_mint,
    )]
    pub user_collateral_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_top_up_position(ctx: Context<TopUpPosition>, additional_collateral: u64) -> Result<()> {
    require!(!ctx.accounts.protocol.paused, ErrorCode::ProtocolPaused);
    require!(additional_collateral > 0, ErrorCode::InvalidParameter);

    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_collateral_ata.to_account_info(),
                to: ctx.accounts.collateral_vault.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        additional_collateral,
    )?;

    let position = &mut ctx.accounts.position;
    position.collateral_amount = position
        .collateral_amount
        .checked_add(additional_collateral)
        .ok_or(ErrorCode::MathOverflow)?;
    position.last_updated = Clock::get()?.unix_timestamp;

    let config = &mut ctx.accounts.collateral_config;
    config.total_deposited = config
        .total_deposited
        .checked_add(additional_collateral)
        .ok_or(ErrorCode::MathOverflow)?;

    emit!(TopUpPositionEvent {
        owner: ctx.accounts.owner.key(),
        collateral_mint: config.collateral_mint,
        additional_collateral,
        new_total_collateral: position.collateral_amount,
    });

    Ok(())
}

#[event]
pub struct TopUpPositionEvent {
    pub owner: Pubkey,
    pub collateral_mint: Pubkey,
    pub additional_collateral: u64,
    pub new_total_collateral: u64,
}
