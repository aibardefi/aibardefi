use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::OrderbookError;
use crate::{Side, OrderType};

#[derive(Accounts)]
pub struct PlaceOrder<'info> {
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

pub fn handle_place_order(
    ctx: Context<PlaceOrder>,
    side: Side,
    price: u64,
    size: u64,
    order_type: OrderType,
    leverage: u8,
) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let user_account = &mut ctx.accounts.user_account;

    require!(leverage >= 1 && leverage <= market.max_leverage, OrderbookError::InvalidLeverage);
    require!(size >= market.min_order_size, OrderbookError::OrderTooSmall);
    require!(
        order_type == OrderType::Market || price % market.tick_size == 0,
        OrderbookError::InvalidTickSize,
    );
    require!((market.order_count as usize) < MAX_ORDERS, OrderbookError::MarketFull);

    let margin_required = size
        .checked_mul(price)
        .ok_or(OrderbookError::MathOverflow)?
        .checked_div(leverage as u64)
        .ok_or(OrderbookError::MathOverflow)?
        .checked_div(1_000_000)
        .ok_or(OrderbookError::MathOverflow)?;

    let available = user_account.balance.saturating_sub(user_account.locked_margin);
    require!(margin_required <= available, OrderbookError::InsufficientMargin);

    user_account.locked_margin = user_account.locked_margin
        .checked_add(margin_required)
        .ok_or(OrderbookError::MathOverflow)?;

    let order_id = market.next_order_id;
    market.next_order_id += 1;

    let clock = Clock::get()?;
    let order = Order {
        id: order_id,
        owner: ctx.accounts.owner.key(),
        side: if side == Side::Long { 0 } else { 1 },
        order_type: if order_type == OrderType::Limit { 0 } else { 1 },
        price,
        size,
        filled: 0,
        leverage,
        timestamp: clock.unix_timestamp,
        active: true,
    };

    let slot = market.orders.iter().position(|o| !o.active)
        .ok_or(OrderbookError::MarketFull)?;
    market.orders[slot] = order;
    market.order_count += 1;

    update_bbo(market);

    msg!("Order {} placed: {:?} {} @ {} ({}x)",
        order_id,
        if side == Side::Long { "LONG" } else { "SHORT" },
        size, price, leverage);

    Ok(())
}

fn update_bbo(market: &mut Market) {
    let mut best_bid: u64 = 0;
    let mut best_ask: u64 = u64::MAX;

    for order in market.orders.iter() {
        if !order.active || order.remaining() == 0 {
            continue;
        }
        match order.side() {
            Side::Long => {
                if order.price > best_bid {
                    best_bid = order.price;
                }
            }
            Side::Short => {
                if order.price < best_ask {
                    best_ask = order.price;
                }
            }
        }
    }

    market.best_bid = best_bid;
    market.best_ask = best_ask;
}
