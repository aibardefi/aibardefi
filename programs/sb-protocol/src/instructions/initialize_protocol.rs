use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Protocol::SIZE,
        seeds = [PROTOCOL_SEED],
        bump,
    )]
    pub protocol: Account<'info, Protocol>,

    #[account(
        init,
        payer = authority,
        mint::decimals = SB_DECIMALS,
        mint::authority = protocol,
    )]
    pub sb_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = sb_mint,
        token::authority = protocol,
        seeds = [TREASURY_VAULT_SEED, protocol.key().as_ref()],
        bump,
    )]
    pub treasury_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeProtocol>,
    utilization_cap_bps: u16,
    treasury_reserve_bps: u16,
) -> Result<()> {
    require!(
        utilization_cap_bps <= BPS_DENOMINATOR as u16,
        ErrorCode::InvalidParameter
    );
    require!(
        treasury_reserve_bps <= BPS_DENOMINATOR as u16,
        ErrorCode::InvalidParameter
    );

    let protocol = &mut ctx.accounts.protocol;
    protocol.authority = ctx.accounts.authority.key();
    protocol.sb_mint = ctx.accounts.sb_mint.key();
    protocol.treasury_vault = ctx.accounts.treasury_vault.key();
    protocol.paused = false;
    protocol.total_positions = 0;
    protocol.total_sb_borrowed = 0;
    protocol.utilization_cap_bps = utilization_cap_bps;
    protocol.treasury_reserve_bps = treasury_reserve_bps;
    protocol.bump = ctx.bumps.protocol;

    let bump = ctx.bumps.protocol;
    let seeds: &[&[u8]] = &[PROTOCOL_SEED, &[bump]];
    let signer_seeds = &[seeds];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.sb_mint.to_account_info(),
                to: ctx.accounts.treasury_vault.to_account_info(),
                authority: ctx.accounts.protocol.to_account_info(),
            },
            signer_seeds,
        ),
        SB_TOTAL_SUPPLY,
    )?;

    emit!(InitializeProtocolEvent {
        authority: ctx.accounts.authority.key(),
        sb_mint: ctx.accounts.sb_mint.key(),
        total_supply: SB_TOTAL_SUPPLY,
    });

    Ok(())
}

#[event]
pub struct InitializeProtocolEvent {
    pub authority: Pubkey,
    pub sb_mint: Pubkey,
    pub total_supply: u64,
}
