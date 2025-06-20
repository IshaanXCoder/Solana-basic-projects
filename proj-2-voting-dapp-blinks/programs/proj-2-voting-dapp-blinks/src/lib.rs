use anchor_lang::prelude::*;

declare_id!("8aMGnq2gvuahCELse4FEjZgJiQMtiF75oAGbYGt3DGPh");

#[program]
pub mod proj_2_voting_dapp_blinks {
    use super::*;
    
    pub fn initialize_poll(xtx: Context<InitializePoll>, _poll_id: u64) -> Result<()> {
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init, payer = signer, space = 8 + poll::INIT_SPACE, seeds = [poll_id.to_le_bytes().as_ref()], bump)]
    pub poll: Account<'info, Poll>,
}


#[account]
#[derive(InitSpace)]
pub struct Poll{
    pub poll_id: u64,
    #[max_len(320)]
    pub description: String,
    #[max_len(32)]
    pub title: String,
    pub poll_start: u64,
    pub poll_end: u64,
} 