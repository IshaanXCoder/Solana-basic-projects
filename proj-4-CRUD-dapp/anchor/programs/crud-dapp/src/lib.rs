#![allow(clippy::result_large_err)]
use anchor_lang::{prelude::*, solana_program::decode_error};

declare_id!("3WwprAAsUyECGnCXL73oEUCbR83a8ipJ2Bqe9tHw2MmE");

#[program]
mod crud_dapp {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }
    pub fn update_journal(ctx: Context<UpdateEntry>, _title: String, message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal(ctx: Context<DeleteEntry>, title: String)-> Result<()>{
        Ok(())
    }

}

// now we'll create a PDA for the journal entry update

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(init, 
        payer = owner, 
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        space = 8 + JournalEntryState::INIT_SPACE)
    ]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// now we'll create the update entry account
#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info>{
    #[account(mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
        //this realloc::zero will set the orgiianl calcualtion of space to zero and recalulate everythin

    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info>{
    #[account(
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner 
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(280)]
    pub message: String,
}