use anchor_lang::prelude::*;
use anchor_spl:: token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::bank;

#[derive(Accounts)]
pub struct InitBank<'info>{
    pub signer: Signer<'info>,
    //InterfaceAccount<'info, TokenAccount> lets your program work with both token-2022 and legacy token programs, which differ slightly but expose the same interface.
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        init, 
        payer = signer,
        space = 8 + InitBank::init_space(),
        seeds = [mint.key().as_ref()],
        bump,
        //Mint is defined in the SPL Token program — not your program, hence it is an interface account, and not a regular account.
    )]

    //so we have a bank which haas all the info, but we need another pda, a token acocunt, which is the bank's token account
    pub bank: Account<'info, Bank>,
    #[account(
        init,
        token::mint = mint,
        token::authority = bank,
        payer = signer,
        seeds = [b"treasury", mint.key().as_ref()],
        bump,
        // Bank is our custom struct, defined by you inside state.rs.   
         )]
    pub bank_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Program<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    
    
     
}