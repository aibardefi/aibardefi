use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"user", market.key().as_ref(), owner.key().as_ref()],
        bump = user_account.bump,
        has_one = owner @ OrderbookError::Unauthorized,
    )]
    pub user_account: Account<'info, UserAccount>,

    pub owner: Signer<'info>,
}

pub fn handle_settle(ctx: Context<Settle>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_account = &mut ctx.accounts.user_account;
    let owner_key = ctx.accounts.owner.key();

    let mut total_unlocked: u64 = 0;

    for order in market.orders.iter_mut() {
        if order.owner != owner_key || order.filled == 0 {
            continue;
        }

        let filled = order.filled;
        let margin_to_unlock = order.margin_for_size(filled);
        total_unlocked = total_unlocked.saturating_add(margin_to_unlock);

        emit!(SettleEvent {
            owner: owner_key,
            order_id: order.id,
            margin_unlocked: margin_to_unlock,
        });

        if !order.active {
            order.filled = 0;
        } else {
            order.size = order.remaining();
            order.filled = 0;
        }
    }

    require!(total_unlocked > 0, OrderbookError::NothingToSettle);

    user_account.locked_margin = user_account.locked_margin.saturating_sub(total_unlocked);

    market.update_bbo();

    Ok(())
}
