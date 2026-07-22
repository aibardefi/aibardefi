use anchor_lang::prelude::*;

declare_id!("h82pJGF9p7kpzb6eU326EFZf2cDnimbTFVeJtx1qtBm");

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;

#[program]
pub mod orderbook {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_index: u16,
        tick_size: u64,
        min_order_size: u64,
        max_leverage: u8,
    ) -> Result<()> {
        instructions::initialize_market::handle_initialize_market(
            ctx, market_index, tick_size, min_order_size, max_leverage,
        )
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handle_deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handle_withdraw(ctx, amount)
    }

    pub fn place_order(
        ctx: Context<PlaceOrder>,
        side: Side,
        price: u64,
        size: u64,
        order_type: OrderType,
        leverage: u8,
    ) -> Result<()> {
        instructions::place_order::handle_place_order(ctx, side, price, size, order_type, leverage)
    }

    pub fn cancel_order(ctx: Context<CancelOrder>, order_id: u64) -> Result<()> {
        instructions::cancel_order::handle_cancel_order(ctx, order_id)
    }

    pub fn settle(ctx: Context<Settle>) -> Result<()> {
        instructions::settle::handle_settle(ctx)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Long,
    Short,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum OrderType {
    Limit,
    Market,
}
