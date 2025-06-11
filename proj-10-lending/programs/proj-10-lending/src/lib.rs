use anchor_lang::prelude::*;
mod state;
declare_id!("F9xepnat98Qc3dMTTWowwS2iMvGUHChD2rQhyfhHEdvV");

#[program]
pub mod proj_10_lending {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
