use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        init_if_needed,
        payer = owner,
        space = UserAccount::LEN,
        seeds = [b"user", owner.key().as_ref()],
        bump,
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

pub fn handle_deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    user_account.owner = ctx.accounts.owner.key();
    user_account.bump = ctx.bumps.user_account;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        amount,
    )?;

    user_account.balance = user_account.balance.checked_add(amount).unwrap();

    msg!("Deposited {} lamports", amount);
    Ok(())
}
