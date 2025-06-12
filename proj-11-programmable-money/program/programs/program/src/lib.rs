use anchor_lang::prelude::*;

use state::*;
mod state;
use constants::*;
mod constants;
pub use instructions::*;
mod instructions;
declare_id!("HqKVbLrvW6qaVUtRhFtT5zDbk1TWmFZoaWi1UPLsyRVB");

#[program]
pub mod stablecoin {
    use super::*;

    pub fn initialize_config(ctx: Context<InitializeConfig>) -> Result<()> {
        initialize_config(ctx)
    }

    pub fn update_config(ctx: Context<InitializeConfig>, min_health_factor: u64)-> Result<()>{
        //yaha changes krnehe
        
    }
}
