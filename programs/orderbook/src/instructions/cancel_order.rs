use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;

#[derive(Accounts)]
pub struct CancelOrder<'info> {
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

pub fn handle_cancel_order(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_account = &mut ctx.accounts.user_account;
    let owner_key = ctx.accounts.owner.key();

    let order_idx = market.orders.iter().position(|o| o.active && o.id == order_id)
        .ok_or(OrderbookError::OrderNotFound)?;

    let order = &market.orders[order_idx];
    require!(order.owner == owner_key, OrderbookError::Unauthorized);

    let remaining = order.remaining();
    let margin_to_unlock = order.margin_for_size(remaining);
    let market_index = market.market_index;

    user_account.locked_margin = user_account.locked_margin.saturating_sub(margin_to_unlock);

    market.orders[order_idx].active = false;
    market.order_count = market.order_count.saturating_sub(1);

    market.update_bbo();

    emit!(OrderCancelledEvent {
        market_index,
        order_id,
        owner: owner_key,
    });

    Ok(())
}
