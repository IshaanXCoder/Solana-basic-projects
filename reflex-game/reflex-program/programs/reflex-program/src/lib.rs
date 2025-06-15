use anchor_lang::prelude::*;

declare_id!("7NhBKCjaTmK7LxtTs3ewGADnCi5p5mZr2PUYeics998x");

#[program]
pub mod reflex_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]

pub struct Initialize {}
