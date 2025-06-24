use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{TokenInterface, Mint, TokenAccount},
    associated_token::AssociatedToken,
    token::Token,
    metadata::{Metadata as TokenMetadata},
};

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod token_lottery {
    use super::*;

    pub fn initialize_config(ctx: Context<Initialize>, start: u64, end: u64, price: u64) -> Result<()> {
        ctx.accounts.token_lottery.bump = ctx.bumps.token_lottery;
        ctx.accounts.token_lottery.start_time = start;
        ctx.accounts.token_lottery.end_time = end;
        ctx.accounts.token_lottery.ticket_price = price;
        ctx.accounts.token_lottery.authority = *ctx.accounts.payer.key;
        ctx.accounts.token_lottery.lottery_pot_amount = 0;
        ctx.accounts.token_lottery.total_tickers = 0;
        ctx.accounts.token_lottery.random_account = Pubkey::default();
        ctx.accounts.token_lottery.winner = Pubkey::default();
        ctx.accounts.token_lottery.winner_claimed = false;
        Ok(())
    }

    pub fn initialize_lottery(ctx: Context<InitializeLottery>, lottery_id: u64) -> Result<()> {

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + TokenLottery::INIT_SPACE,
        seeds = [b"token_lottery".as_ref()],
        bump,
    )]
    pub token_lottery: Account<'info, TokenLottery>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer,
        seeds = [b"collection_mint".as_ref()],
        bump,
    )]
    pub collection_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = payer,
        token::mint = collection_mint,
        token::authority = collection_token_account,
        seeds = [b"collection_associated_token".as_ref()],
        bump, 
    )]
    pub collection_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref()], bump, seeds::program = token_metadata_program.key())]
    ///This account is checked by the metadata smart contract
    pub metadata: InterfaceAccount<'info, TokenMetadata>,

    #[account(mut, seeds = [b"metadata", token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), b"master_edition".as_ref()], bump, seeds::program = token_metadata_program.key())]
    ///This account is checked by the metadata smart contract
    pub master_edition: UncheckedAccount<'info>,



    
    pub token_metadata_program: Program<'info, TokenMetadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
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

#[account]
#[derive(InitSpace)]
pub struct Lottery {}