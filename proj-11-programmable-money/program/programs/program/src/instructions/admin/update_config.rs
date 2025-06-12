use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut, seeds = [SEED_CONFIG_ACCOUNT], bump = config.bump)]
    pub config_account: Account<'info, Config>,
}

pub fn process_update_config(ctx: Context<UpdateConfig>, min_health_factor: u64) -> Result<()> {
    let config_account = 
    Ok(());
}