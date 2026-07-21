use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;
use crate::Side;

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"user", owner.key().as_ref()],
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
    let margin_to_unlock = remaining
        .checked_mul(order.price)
        .unwrap_or(0)
        .checked_div(order.leverage as u64)
        .unwrap_or(0)
        .checked_div(1_000_000)
        .unwrap_or(0);

    user_account.locked_margin = user_account.locked_margin.saturating_sub(margin_to_unlock);

    market.orders[order_idx].active = false;
    market.order_count = market.order_count.saturating_sub(1);

    let mut best_bid: u64 = 0;
    let mut best_ask: u64 = u64::MAX;
    for o in market.orders.iter() {
        if !o.active || o.remaining() == 0 { continue; }
        match o.side() {
            Side::Long => { if o.price > best_bid { best_bid = o.price; } }
            Side::Short => { if o.price < best_ask { best_ask = o.price; } }
        }
    }
    market.best_bid = best_bid;
    market.best_ask = best_ask;

    msg!("Order {} cancelled", order_id);
    Ok(())
}
