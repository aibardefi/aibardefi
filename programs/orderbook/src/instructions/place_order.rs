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
        seeds = [b"user", market.key().as_ref(), owner.key().as_ref()],
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

    let side_u8: u8 = if side == Side::Long { 0 } else { 1 };
    let order_type_u8: u8 = if order_type == OrderType::Limit { 0 } else { 1 };

    let margin_required = size
        .checked_mul(price)
        .ok_or(OrderbookError::MathOverflow)?
        .checked_div(leverage as u64)
        .ok_or(OrderbookError::MathOverflow)?
        .checked_div(PRICE_DECIMALS)
        .ok_or(OrderbookError::MathOverflow)?;

    let available = user_account.balance.saturating_sub(user_account.locked_margin);
    require!(margin_required <= available, OrderbookError::InsufficientMargin);

    user_account.locked_margin = user_account.locked_margin
        .checked_add(margin_required)
        .ok_or(OrderbookError::MathOverflow)?;

    let order_id = market.next_order_id;
    market.next_order_id += 1;

    let clock = Clock::get()?;
    let market_index = market.market_index;
    let owner_key = ctx.accounts.owner.key();

    let mut remaining_size = size;
    let mut total_filled = 0u64;

    loop {
        if remaining_size == 0 {
            break;
        }

        let opposing_idx = find_best_opposing(
            market, side_u8, price, order_type == OrderType::Market,
        );

        let Some(idx) = opposing_idx else {
            break;
        };

        let maker_remaining = market.orders[idx].remaining();
        let fill_size = remaining_size.min(maker_remaining);
        let fill_price = market.orders[idx].price;

        market.orders[idx].filled = market.orders[idx].filled.saturating_add(fill_size);
        if market.orders[idx].remaining() == 0 {
            market.orders[idx].active = false;
            market.order_count = market.order_count.saturating_sub(1);
        }

        remaining_size -= fill_size;
        total_filled += fill_size;

        market.last_trade_price = fill_price;
        market.total_volume = market.total_volume
            .checked_add(
                (fill_size as u128).checked_mul(fill_price as u128).unwrap_or(0),
            )
            .unwrap_or(market.total_volume);

        emit!(OrderMatchedEvent {
            market_index,
            maker_order_id: market.orders[idx].id,
            taker_order_id: order_id,
            maker: market.orders[idx].owner,
            taker: owner_key,
            price: fill_price,
            size: fill_size,
        });
    }

    if total_filled > 0 {
        let filled_margin = total_filled
            .checked_mul(price)
            .unwrap_or(0)
            .checked_div(leverage as u64)
            .unwrap_or(0)
            .checked_div(PRICE_DECIMALS)
            .unwrap_or(0);
        user_account.locked_margin = user_account.locked_margin.saturating_sub(filled_margin);
    }

    if order_type == OrderType::Market {
        require!(total_filled > 0, OrderbookError::NoLiquidity);
        if remaining_size > 0 {
            let unfilled_margin = remaining_size
                .checked_mul(price)
                .unwrap_or(0)
                .checked_div(leverage as u64)
                .unwrap_or(0)
                .checked_div(PRICE_DECIMALS)
                .unwrap_or(0);
            user_account.locked_margin = user_account.locked_margin.saturating_sub(unfilled_margin);
        }
    }

    if remaining_size > 0 && order_type == OrderType::Limit {
        require!((market.order_count as usize) < MAX_ORDERS, OrderbookError::MarketFull);

        let slot = market.orders.iter().position(|o| !o.active)
            .ok_or(OrderbookError::MarketFull)?;

        market.orders[slot] = Order {
            id: order_id,
            owner: owner_key,
            side: side_u8,
            order_type: order_type_u8,
            price,
            size: remaining_size,
            filled: 0,
            leverage,
            timestamp: clock.unix_timestamp,
            active: true,
        };
        market.order_count += 1;
    }

    market.update_bbo();

    emit!(OrderPlacedEvent {
        market_index,
        order_id,
        owner: owner_key,
        side: side_u8,
        price,
        size,
        order_type: order_type_u8,
        leverage,
    });

    Ok(())
}

fn find_best_opposing(
    market: &Market,
    taker_side: u8,
    taker_price: u64,
    is_market: bool,
) -> Option<usize> {
    let opposing_side: u8 = if taker_side == 0 { 1 } else { 0 };
    let mut best_idx: Option<usize> = None;
    let mut best_price: u64 = if taker_side == 0 { u64::MAX } else { 0 };
    let mut best_time: i64 = i64::MAX;

    for (i, order) in market.orders.iter().enumerate() {
        if !order.active || order.remaining() == 0 || order.side != opposing_side {
            continue;
        }

        let price_ok = is_market || if taker_side == 0 {
            order.price <= taker_price
        } else {
            order.price >= taker_price
        };

        if !price_ok {
            continue;
        }

        let is_better = if taker_side == 0 {
            order.price < best_price
                || (order.price == best_price && order.timestamp < best_time)
        } else {
            order.price > best_price
                || (order.price == best_price && order.timestamp < best_time)
        };

        if is_better {
            best_price = order.price;
            best_time = order.timestamp;
            best_idx = Some(i);
        }
    }

    best_idx
}
