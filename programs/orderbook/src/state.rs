use anchor_lang::prelude::*;

pub const MAX_ORDERS: usize = 128;
pub const PRICE_DECIMALS: u64 = 1_000_000;

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub market_index: u16,
    pub tick_size: u64,
    pub min_order_size: u64,
    pub max_leverage: u8,
    pub quote_mint: Pubkey,
    pub next_order_id: u64,
    pub best_bid: u64,
    pub best_ask: u64,
    pub last_trade_price: u64,
    pub total_volume: u128,
    pub order_count: u16,
    pub bump: u8,
    pub vault_bump: u8,
    pub orders: [Order; MAX_ORDERS],
}

impl Market {
    pub const LEN: usize = 32 + 2 + 8 + 8 + 1 + 32 + 8 + 8 + 8 + 8 + 16 + 2 + 1 + 1
        + (Order::LEN * MAX_ORDERS);

    pub fn update_bbo(&mut self) {
        let mut best_bid = 0u64;
        let mut best_ask = u64::MAX;

        for order in self.orders.iter() {
            if !order.active || order.remaining() == 0 {
                continue;
            }
            if order.side == 0 && order.price > best_bid {
                best_bid = order.price;
            }
            if order.side == 1 && order.price < best_ask {
                best_ask = order.price;
            }
        }

        self.best_bid = best_bid;
        self.best_ask = best_ask;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Default)]
pub struct Order {
    pub id: u64,
    pub owner: Pubkey,
    pub side: u8,
    pub order_type: u8,
    pub price: u64,
    pub size: u64,
    pub filled: u64,
    pub leverage: u8,
    pub timestamp: i64,
    pub active: bool,
}

impl Order {
    pub const LEN: usize = 8 + 32 + 1 + 1 + 8 + 8 + 8 + 1 + 8 + 1;

    pub fn remaining(&self) -> u64 {
        self.size.saturating_sub(self.filled)
    }

    pub fn margin_for_size(&self, qty: u64) -> u64 {
        qty.checked_mul(self.price)
            .and_then(|v| v.checked_div(self.leverage as u64))
            .and_then(|v| v.checked_div(PRICE_DECIMALS))
            .unwrap_or(0)
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
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

// --- Events ---

#[event]
pub struct OrderPlacedEvent {
    pub market_index: u16,
    pub order_id: u64,
    pub owner: Pubkey,
    pub side: u8,
    pub price: u64,
    pub size: u64,
    pub order_type: u8,
    pub leverage: u8,
}

#[event]
pub struct OrderMatchedEvent {
    pub market_index: u16,
    pub maker_order_id: u64,
    pub taker_order_id: u64,
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub price: u64,
    pub size: u64,
}

#[event]
pub struct OrderCancelledEvent {
    pub market_index: u16,
    pub order_id: u64,
    pub owner: Pubkey,
}

#[event]
pub struct DepositEvent {
    pub owner: Pubkey,
    pub amount: u64,
}

#[event]
pub struct WithdrawEvent {
    pub owner: Pubkey,
    pub amount: u64,
}

#[event]
pub struct SettleEvent {
    pub owner: Pubkey,
    pub order_id: u64,
    pub margin_unlocked: u64,
}
