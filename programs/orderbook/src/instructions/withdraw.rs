use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"user", owner.key().as_ref()],
        bump = user_account.bump,
        has_one = owner @ OrderbookError::Unauthorized,
    )]
    pub user_account: Account<'info, UserAccount>,

    /// CHECK: vault PDA that holds SOL
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    let available = user_account.balance.saturating_sub(user_account.locked_margin);

    require!(amount <= available, OrderbookError::InsufficientBalance);

    let vault = &ctx.accounts.vault;
    let rent = Rent::get()?;
    let min_balance = rent.minimum_balance(0);
    let vault_balance = vault.lamports();

    require!(
        vault_balance.saturating_sub(amount) >= min_balance,
        OrderbookError::InsufficientBalance
    );

    **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;

    user_account.balance = user_account.balance.checked_sub(amount).unwrap();

    msg!("Withdrew {} lamports", amount);
    Ok(())
}
