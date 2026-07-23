use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    pub oracle_authority: Signer<'info>,

    #[account(
        mut,
        constraint = price_feed.oracle_authority == oracle_authority.key() @ ErrorCode::InvalidAuthority,
    )]
    pub price_feed: Account<'info, PriceFeed>,
}

pub fn handle_update_price(ctx: Context<UpdatePrice>, price: u64, confidence: u64) -> Result<()> {
    require!(price > 0, ErrorCode::InvalidPrice);

    let clock = Clock::get()?;
    let feed = &mut ctx.accounts.price_feed;

    if feed.last_update > 0 {
        let elapsed = clock
            .unix_timestamp
            .checked_sub(feed.last_update)
            .ok_or(ErrorCode::MathOverflow)?;
        require!(
            elapsed >= feed.min_update_interval,
            ErrorCode::InvalidParameter
        );
    }

    if feed.twap_price == 0 {
        feed.twap_price = price;
    } else {
        let weighted_old = (feed.twap_price as u128)
            .checked_mul(7)
            .ok_or(ErrorCode::MathOverflow)?;
        let weighted_new = (price as u128)
            .checked_mul(3)
            .ok_or(ErrorCode::MathOverflow)?;
        feed.twap_price = weighted_old
            .checked_add(weighted_new)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10)
            .ok_or(ErrorCode::MathOverflow)? as u64;
    }

    feed.price = price;
    feed.confidence = confidence;
    feed.last_update = clock.unix_timestamp;

    emit!(PriceUpdateEvent {
        asset_mint: feed.asset_mint,
        price,
        twap_price: feed.twap_price,
    });

    Ok(())
}

#[event]
pub struct PriceUpdateEvent {
    pub asset_mint: Pubkey,
    pub price: u64,
    pub twap_price: u64,
}
