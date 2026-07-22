use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::OrderbookError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"user", market.key().as_ref(), owner.key().as_ref()],
        bump = user_account.bump,
        has_one = owner,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"vault", &market.market_index.to_le_bytes()],
        bump = market.vault_bump,
    )]
    pub quote_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == market.quote_mint,
        constraint = user_token_account.owner == owner.key(),
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let user = &ctx.accounts.user_account;
    let available = user.balance.saturating_sub(user.locked_margin);
    require!(amount <= available, OrderbookError::InsufficientBalance);

    let market_index = ctx.accounts.market.market_index;
    let bump = ctx.accounts.market.bump;
    let index_bytes = market_index.to_le_bytes();
    let seeds: &[&[u8]] = &[b"market", index_bytes.as_ref(), &[bump]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.quote_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
            },
            &[seeds],
        ),
        amount,
    )?;

    ctx.accounts.user_account.balance = ctx.accounts.user_account.balance
        .checked_sub(amount)
        .unwrap();

    emit!(WithdrawEvent {
        owner: ctx.accounts.owner.key(),
        amount,
    });

    Ok(())
}
