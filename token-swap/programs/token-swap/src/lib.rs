use anchor_lang::error_code;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};
use std::convert::TryFrom;
use anchor_spl::{associated_token};

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

pub mod errors;
pub use errors::*;



declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod token_swap {
    use super::*;

    pub fn initialize(ctx: Context<InitializePool>, amount: u64) -> Result<()> {
        initialize_pool::exec(ctx)
    }

    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        deposit_token::exec(ctx, amount)
    }
}

