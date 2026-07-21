use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;
use crate::Side;

#[derive(Accounts)]
pub struct CrankMatch<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    pub cranker: Signer<'info>,
}

pub fn handle_crank_match(ctx: Context<CrankMatch>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let mut matched = false;

    loop {
        let (bid_idx, ask_idx) = find_matchable_pair(market);

        if bid_idx.is_none() || ask_idx.is_none() {
            break;
        }

        let bi = bid_idx.unwrap();
        let ai = ask_idx.unwrap();

        let bid_price = market.orders[bi].price;
        let ask_price = market.orders[ai].price;

        if bid_price < ask_price {
            break;
        }

        let bid_remaining = market.orders[bi].remaining();
        let ask_remaining = market.orders[ai].remaining();
        let fill_size = bid_remaining.min(ask_remaining);
        let fill_price = if market.orders[bi].timestamp <= market.orders[ai].timestamp {
            bid_price
        } else {
            ask_price
        };

        market.orders[bi].filled = market.orders[bi].filled.saturating_add(fill_size);
        market.orders[ai].filled = market.orders[ai].filled.saturating_add(fill_size);

        if market.orders[bi].remaining() == 0 {
            market.orders[bi].active = false;
            market.order_count = market.order_count.saturating_sub(1);
        }
        if market.orders[ai].remaining() == 0 {
            market.orders[ai].active = false;
            market.order_count = market.order_count.saturating_sub(1);
        }

        market.last_trade_price = fill_price;
        market.total_volume = market.total_volume
            .checked_add((fill_size as u128).checked_mul(fill_price as u128).unwrap_or(0))
            .unwrap_or(market.total_volume);

        msg!("Match: {} @ {} (size: {})", fill_price, fill_size, fill_size);
        matched = true;
    }

    require!(matched, OrderbookError::NoMatchableOrders);

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

    Ok(())
}

fn find_matchable_pair(market: &Market) -> (Option<usize>, Option<usize>) {
    let mut best_bid_idx: Option<usize> = None;
    let mut best_bid_price: u64 = 0;
    let mut best_bid_time: i64 = i64::MAX;

    let mut best_ask_idx: Option<usize> = None;
    let mut best_ask_price: u64 = u64::MAX;
    let mut best_ask_time: i64 = i64::MAX;

    for (i, order) in market.orders.iter().enumerate() {
        if !order.active || order.remaining() == 0 {
            continue;
        }

        match order.side() {
            Side::Long => {
                if order.price > best_bid_price
                    || (order.price == best_bid_price && order.timestamp < best_bid_time)
                {
                    best_bid_price = order.price;
                    best_bid_time = order.timestamp;
                    best_bid_idx = Some(i);
                }
            }
            Side::Short => {
                if order.price < best_ask_price
                    || (order.price == best_ask_price && order.timestamp < best_ask_time)
                {
                    best_ask_price = order.price;
                    best_ask_time = order.timestamp;
                    best_ask_idx = Some(i);
                }
            }
        }
    }

    (best_bid_idx, best_ask_idx)
}
