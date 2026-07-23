use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateCollateralConfig<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [PROTOCOL_SEED],
        bump = protocol.bump,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub protocol: Account<'info, Protocol>,

    #[account(
        mut,
        seeds = [COLLATERAL_CONFIG_SEED, collateral_config.collateral_mint.as_ref()],
        bump = collateral_config.bump,
    )]
    pub collateral_config: Account<'info, CollateralConfig>,
}

pub fn handle_update_collateral_config(
    ctx: Context<UpdateCollateralConfig>,
    max_initial_ltv_bps: u16,
    liquidation_threshold_bps: u16,
    debt_ceiling: u64,
    max_position_size: u64,
    min_position_size: u64,
    active: bool,
) -> Result<()> {
    require!(
        max_initial_ltv_bps < liquidation_threshold_bps,
        ErrorCode::LtvTooHigh
    );
    require!(
        (liquidation_threshold_bps as u64) <= BPS_DENOMINATOR,
        ErrorCode::InvalidParameter
    );
    require!(
        (max_initial_ltv_bps as u64) <= BPS_DENOMINATOR,
        ErrorCode::InvalidParameter
    );

    let config = &mut ctx.accounts.collateral_config;
    config.max_initial_ltv_bps = max_initial_ltv_bps;
    config.liquidation_threshold_bps = liquidation_threshold_bps;
    config.debt_ceiling = debt_ceiling;
    config.max_position_size = max_position_size;
    config.min_position_size = min_position_size;
    config.active = active;

    Ok(())
}
