use anchor_lang::prelude::*;

declare_id!("HqKVbLrvW6qaVUtRhFtT5zDbk1TWmFZoaWi1UPLsyRVB");

#[program]
pub mod program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
