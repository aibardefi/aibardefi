use anchor_lang::prelude::*;

mod errors;
mod instructions;
mod state;

pub use instructions::*;
pub use state::*;

declare_id!("SBProt1111111111111111111111111111111111111");

#[program]
pub mod sb_protocol {
    use super::*;

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        utilization_cap_bps: u16,
        treasury_reserve_bps: u16,
    ) -> Result<()> {
        instructions::initialize_protocol::handle_initialize_protocol(ctx, utilization_cap_bps, treasury_reserve_bps)
    }

    pub fn add_collateral(
        ctx: Context<AddCollateral>,
        max_initial_ltv_bps: u16,
        liquidation_threshold_bps: u16,
        debt_ceiling: u64,
        max_position_size: u64,
        min_position_size: u64,
    ) -> Result<()> {
        instructions::add_collateral::handle_add_collateral(
            ctx,
            max_initial_ltv_bps,
            liquidation_threshold_bps,
            debt_ceiling,
            max_position_size,
            min_position_size,
        )
    }

    pub fn update_collateral_config(
        ctx: Context<UpdateCollateralConfig>,
        max_initial_ltv_bps: u16,
        liquidation_threshold_bps: u16,
        debt_ceiling: u64,
        max_position_size: u64,
        min_position_size: u64,
        active: bool,
    ) -> Result<()> {
        instructions::update_collateral_config::handle_update_collateral_config(
            ctx,
            max_initial_ltv_bps,
            liquidation_threshold_bps,
            debt_ceiling,
            max_position_size,
            min_position_size,
            active,
        )
    }

    pub fn open_position(
        ctx: Context<OpenPosition>,
        collateral_amount: u64,
        sb_amount: u64,
    ) -> Result<()> {
        instructions::open_position::handle_open_position(ctx, collateral_amount, sb_amount)
    }

    pub fn top_up_position(
        ctx: Context<TopUpPosition>,
        additional_collateral: u64,
    ) -> Result<()> {
        instructions::top_up_position::handle_top_up_position(ctx, additional_collateral)
    }

    pub fn repay_position(ctx: Context<RepayPosition>) -> Result<()> {
        instructions::repay_position::handle_repay_position(ctx)
    }

    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        instructions::liquidate::handle_liquidate(ctx)
    }

    pub fn update_price(ctx: Context<UpdatePrice>, price: u64, confidence: u64) -> Result<()> {
        instructions::update_price::handle_update_price(ctx, price, confidence)
    }

    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        instructions::admin::handler_set_paused(ctx, paused)
    }

    pub fn update_protocol(
        ctx: Context<UpdateProtocol>,
        utilization_cap_bps: u16,
        treasury_reserve_bps: u16,
    ) -> Result<()> {
        instructions::admin::handler_update_protocol(ctx, utilization_cap_bps, treasury_reserve_bps)
    }
}
