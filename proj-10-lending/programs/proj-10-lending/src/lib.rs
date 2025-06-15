use anchor_lang::prelude::*;
mod state;
declare_id!("F9xepnat98Qc3dMTTWowwS2iMvGUHChD2rQhyfhHEdvV");

#[program]
pub mod proj_10_lending {
    use super::*;

    pub fn init_bank(ctx: Context<InitBank>, liquidation_threshold: u64, max_ltv: u64 ) -> Result<()>{
        process_init_bank(ctx, liquidation_threshold, max_ltv)
    }
    pub fn init_user(ctx: Context<InitUser>, usdc_address: Pubkey) -> Result<()> {
        process_init_user(ctx, usdc_address)
    }
}
