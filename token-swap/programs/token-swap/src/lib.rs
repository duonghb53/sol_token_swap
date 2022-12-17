use anchor_lang::error_code;
use anchor_lang::prelude::*;
use anchor_spl::associated_token;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};
use std::convert::TryFrom;

pub mod instructions;
pub use instructions::*;

pub mod schema;
pub use schema::*;

pub mod errors;
pub use errors::*;

pub mod calculator;
pub use calculator::*;

pub mod utils;
pub use utils::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
// declare_id!("HtHJ1ZnUS6uX958xPey9h7qrUat6enCodqBnQLDBHA81");

#[program]
pub mod token_swap {
    use super::*;

    pub fn initialize<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, InitializeMint<'info>>,
        amount: u64,
    ) -> Result<()> {
        initialize_mint::exec(ctx, amount)
    }

    pub fn initialize_pool<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, InitializePool<'info>>,
    ) -> Result<()> {
        initialize_pool::exec(ctx)
    }

    pub fn transfer<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, TransferToken<'info>>,
        amount: u64,
    ) -> Result<()> {
        transfer::exec(ctx, amount)
    }

    pub fn deposit_token<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, DepositToken<'info>>,
        amount: u64,
    ) -> Result<()> {
        deposit_token::exec(ctx, amount)
    }

    pub fn withdraw_token<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, WithdrawToken<'info>>,
        amount: u64,
    ) -> Result<()> {
        withdraw_token::exec(ctx, amount)
    }

    pub fn swap<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, Swap<'info>>,
        amount_in: u64,
    ) -> Result<()> {
        swap::exec(ctx, amount_in)
    }
}

