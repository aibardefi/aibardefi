use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::*;
use crate::errors::OrderbookError;

#[derive(Accounts)]
#[instruction(market_index: u16)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Market::LEN,
        seeds = [b"market", market_index.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = authority,
        token::mint = quote_mint,
        token::authority = market,
        seeds = [b"vault", market_index.to_le_bytes().as_ref()],
        bump
    )]
    pub quote_vault: Account<'info, TokenAccount>,

    pub quote_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_initialize_market(
    ctx: Context<InitializeMarket>,
    market_index: u16,
    tick_size: u64,
    min_order_size: u64,
    max_leverage: u8,
) -> Result<()> {
    require!(max_leverage >= 1 && max_leverage <= 50, OrderbookError::InvalidLeverage);

    let market = &mut ctx.accounts.market;
    market.authority = ctx.accounts.authority.key();
    market.market_index = market_index;
    market.tick_size = tick_size;
    market.min_order_size = min_order_size;
    market.max_leverage = max_leverage;
    market.quote_mint = ctx.accounts.quote_mint.key();
    market.next_order_id = 1;
    market.best_bid = 0;
    market.best_ask = u64::MAX;
    market.last_trade_price = 0;
    market.total_volume = 0;
    market.order_count = 0;
    market.bump = ctx.bumps.market;
    market.vault_bump = ctx.bumps.quote_vault;

    msg!("Market {} initialized", market_index);
    Ok(())
}
