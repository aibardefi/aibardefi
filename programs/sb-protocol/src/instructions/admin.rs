use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::*;

#[derive(Accounts)]
pub struct SetPaused<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol.bump,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub protocol: Account<'info, Protocol>,
}

pub fn handler_set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
    ctx.accounts.protocol.paused = paused;

    emit!(ProtocolPausedEvent { paused });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProtocol<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol.bump,
        has_one = authority @ ErrorCode::InvalidAuthority,
    )]
    pub protocol: Account<'info, Protocol>,
}

pub fn handler_update_protocol(
    ctx: Context<UpdateProtocol>,
    utilization_cap_bps: u16,
    treasury_reserve_bps: u16,
) -> Result<()> {
    require!(
        utilization_cap_bps <= BPS_DENOMINATOR as u16,
        ErrorCode::InvalidParameter
    );
    require!(
        treasury_reserve_bps <= BPS_DENOMINATOR as u16,
        ErrorCode::InvalidParameter
    );

    let protocol = &mut ctx.accounts.protocol;
    protocol.utilization_cap_bps = utilization_cap_bps;
    protocol.treasury_reserve_bps = treasury_reserve_bps;

    Ok(())
}

#[event]
pub struct ProtocolPausedEvent {
    pub paused: bool,
}
