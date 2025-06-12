use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Collateral {
    pub depositor: Pubkey,
    pub sol_account: Pubkey,
    pub token_account: Pubkey,
    pub lamport_balance: u64,
    pub amount_minted: u64,
    pub bump: u8,
    pub bump_sol_account: u8,
    //the above two bumps are used to verify the account is valid
    pub is_initialized: bool,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Config {
    //will be the overall authoruty of the program
    pub authority: Pubkey,
    pub mint: Pubkey,

    // to determine if the account is healthy orliqeuidated, we've a liquidatation_threshold, i.e. health factor type shit
    pub liquidation_threshold: u64,
    pub liquidation_bonus: u64,
    pub min_health: u64,
    pub bump: u8,
    pub bump_mint_account: u8,
}
