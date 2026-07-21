use anchor_lang::prelude::*;
use crate::{Side, OrderType};

pub const MAX_ORDERS: usize = 128;

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub market_index: u16,
    pub tick_size: u64,
    pub min_order_size: u64,
    pub max_leverage: u8,
    pub next_order_id: u64,
    pub best_bid: u64,
    pub best_ask: u64,
    pub last_trade_price: u64,
    pub total_volume: u128,
    pub order_count: u16,
    pub orders: [Order; MAX_ORDERS],
    pub bump: u8,
}

impl Market {
    pub const LEN: usize = 8  // discriminator
        + 32                   // authority
        + 2                    // market_index
        + 8                    // tick_size
        + 8                    // min_order_size
        + 1                    // max_leverage
        + 8                    // next_order_id
        + 8                    // best_bid
        + 8                    // best_ask
        + 8                    // last_trade_price
        + 16                   // total_volume
        + 2                    // order_count
        + (Order::LEN * MAX_ORDERS) // orders
        + 1;                   // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Order {
    pub id: u64,
    pub owner: Pubkey,
    pub side: u8,          // 0 = Long, 1 = Short
    pub order_type: u8,    // 0 = Limit, 1 = Market
    pub price: u64,
    pub size: u64,
    pub filled: u64,
    pub leverage: u8,
    pub timestamp: i64,
    pub active: bool,
}

impl Order {
    pub const LEN: usize = 8  // id
        + 32                   // owner
        + 1                    // side
        + 1                    // order_type
        + 8                    // price
        + 8                    // size
        + 8                    // filled
        + 1                    // leverage
        + 8                    // timestamp
        + 1;                   // active

    pub fn side(&self) -> Side {
        if self.side == 0 { Side::Long } else { Side::Short }
    }

    pub fn remaining(&self) -> u64 {
        self.size.saturating_sub(self.filled)
    }
}

#[account]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub locked_margin: u64,
    pub realized_pnl: i64,
    pub bump: u8,
}

impl UserAccount {
    pub const LEN: usize = 8  // discriminator
        + 32                   // owner
        + 8                    // balance
        + 8                    // locked_margin
        + 8                    // realized_pnl
        + 1;                   // bump
}

#[account]
pub struct Position {
    pub owner: Pubkey,
    pub market_index: u16,
    pub side: u8,
    pub size: u64,
    pub entry_price: u64,
    pub leverage: u8,
    pub margin: u64,
    pub unrealized_pnl: i64,
    pub bump: u8,
}

impl Position {
    pub const LEN: usize = 8  // discriminator
        + 32                   // owner
        + 2                    // market_index
        + 1                    // side
        + 8                    // size
        + 8                    // entry_price
        + 1                    // leverage
        + 8                    // margin
        + 8                    // unrealized_pnl
        + 1;                   // bump
}
