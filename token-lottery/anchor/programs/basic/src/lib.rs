use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod token_lottery {
    use super::*;

    pub fn initialize_config(_ctx: Context<Initialize>) -> Result<()> {
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {
    #[account(mut)]
    pub payer: Signer,
    #[account(
        init,
        payer = payer,
        space = 8 + token_lottery::INIT_SPACE,
        seeds = [b"token_lottery".as_ref()],
        bump,
    )]
    pub token_lottery: Account<'info, TokenLottery>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TokenLottery {
    pub bump: u8,
    pub winner: Pubkey,
    pub winner_claimed: bool,
    pub start_time: u64,
    pub end_time: u64,
    pub lottery_pot_amount: u64,
    pub total_tickers: u64,
    pub ticket_price: u64,
    pub authority: Pubkey,
    pub random_account: Pubkey
}