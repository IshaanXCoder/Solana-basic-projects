use anchor_lang::prelude::*;
use crate::{Config, SEED_CONFIG_ACCOUNT, SEED_MINT_ACCOUNT, MINT_DECIMALS, LIQUIDATION_THRESHOLD, LIQUIDATION_BONUS, MIN_HEALTH};
use anchor_spl::token_interface::{Token2022, Mint};


#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, 
            payer = authority, 
            space = 8 + Config::INIT_SPACE, 
            seeds = [SEED_CONFIG_ACCOUNT], 
            bump)]
    pub config: Account<'info, Config>,


    #[account(init, 
        payer = authority, 
        seeds = [SEED_MINT_ACCOUNT], 
        bump, 
        mint::decimals = MINT_DECIMALS, 
        mint::authority = mint_account,
        mint::freeze_authority = mint_account,
        mint::token_program = token_program,
        )]
        pub mint_account: InterfaceAccount<'info, Mint>,
        pub token_program: Program<'info, Token2022>,
        pub system_program: Program<'info, System>,
}

pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
    *ctx.accounts.config = Config {
        authority: ctx.accounts.authority.key(),
        mint: ctx.accounts.mint_account.key(),
        liquidation_threshold: LIQUIDATION_THRESHOLD,
        liquidation_bonus: LIQUIDATION_BONUS,
        min_health: MIN_HEALTH,
        bump: ctx.bumps.config,
        bump_mint_account: ctx.bumps.mint_account,
    }; 
    Ok(())
}