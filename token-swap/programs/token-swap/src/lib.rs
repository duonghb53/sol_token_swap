use anchor_lang::error_code;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
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

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        if ctx.accounts.pool.is_initialized {
            return Err(SwapError::AlreadyInUse.into());
        }

        let (swap_authority, bump_seed) = Pubkey::find_program_address(
            &[&ctx.accounts.pool.to_account_info().key.to_bytes()],
            ctx.program_id,
        );
        let seeds = &[
            &ctx.accounts.pool.to_account_info().key.to_bytes(),
            &[bump_seed][..],
        ];

        if *ctx.accounts.authority.key != swap_authority {
            return Err(SwapError::InvalidProgramAddress.into());
        }

        token::mint_to(
            ctx.accounts
                .into_mint_to_context()
                .with_signer(&[&seeds[..]]),
            INITIAL_SWAP_POOL_AMOUNT,
        )?;

        let pool = &mut ctx.accounts.pool;
        pool.is_initialized = true;
        pool.bump_seed = bump_seed;
        pool.token_program_id = *ctx.accounts.token_program.key;
        pool.token_a_account = *ctx.accounts.token_a.to_account_info().key;
        pool.token_b_account = *ctx.accounts.token_b.to_account_info().key;
        pool.pool_mint = *ctx.accounts.pool_mint.to_account_info().key;
        pool.token_a_mint = ctx.accounts.token_a.mint;
        pool.token_b_mint = ctx.accounts.token_b.mint;

        Ok(())
    }

    // pub fn deposit_token(
    //     ctx: Context<DepositToken>,
    //     source_token_amount: u64,
    // ) -> Result<()> {
    //     let pool = &mut ctx.accounts.pool;

    //     let trade_direction = if ctx.accounts.source.mint == ctx.accounts.swap_token_a.mint {
    //         TradeDirection::AtoB
    //     } else if ctx.accounts.source.mint == ctx.accounts.swap_token_b.mint {
    //         TradeDirection::BtoA
    //     } else {
    //         return Err(SwapError::IncorrectSwapAccount.into());
    //     };

    //     let source = ctx.accounts.source.to_account_info().clone();
    //     let (source_a_info, source_b_info) = match trade_direction {
    //         TradeDirection::AtoB => (Some(&source), None),
    //         TradeDirection::BtoA => (None, Some(&source)),
    //     };

    //     let pool_mint_supply = u128::try_from(ctx.accounts.pool_mint.supply).unwrap();
    //     let pool_token_amount = if pool_mint_supply > 0 {
    //         curve
    //             .deposit_single_token_type(
    //                 u128::try_from(source_token_amount).unwrap(),
    //                 u128::try_from(ctx.accounts.swap_token_a.amount).unwrap(),
    //                 u128::try_from(ctx.accounts.swap_token_b.amount).unwrap(),
    //                 pool_mint_supply,
    //                 trade_direction,
    //             )
    //             .ok_or(SwapError::ZeroTradingTokens)?
    //     } else {
    //         INITIAL_SWAP_POOL_AMOUNT
    //     };

    //     let seeds = &[&pool.to_account_info().key.to_bytes(), &[pool.bump_seed][..]];
    //     let pool_token_amount = u64::try_from(pool_token_amount).unwrap();
    //     if pool_token_amount == 0 {
    //         return Err(SwapError::ZeroTradingTokens.into());
    //     }

    //     match trade_direction {
    //         TradeDirection::AtoB => {
    //             token::transfer(
    //                 ctx.accounts.into_transfer_to_token_a_context(),
    //                 source_token_amount,
    //             )?;
    //         }
    //         TradeDirection::BtoA => {
    //             token::transfer(
    //                 ctx.accounts.into_transfer_to_token_b_context(),
    //                 source_token_amount,
    //             )?;
    //         }
    //     }
    //     token::mint_to(
    //         ctx.accounts
    //             .into_mint_to_context()
    //             .with_signer(&[&seeds[..]]),
    //         pool_token_amount,
    //     )?;

    //     Ok(())
    // }

    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        if pool.to_account_info().owner != ctx.program_id {
            return Err(ProgramError::IncorrectProgramId.into());
        }

        if *ctx.accounts.authority.key
            != authority_id(ctx.program_id, pool.to_account_info().key, pool.bump_seed)?
        {
            return Err(SwapError::InvalidProgramAddress.into());
        }
        if !(*ctx.accounts.swap_source.to_account_info().key == pool.token_a_account
            || *ctx.accounts.swap_source.to_account_info().key == pool.token_b_account)
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }
        if !(*ctx.accounts.swap_destination.to_account_info().key == pool.token_a_account
            || *ctx.accounts.swap_destination.to_account_info().key == pool.token_b_account)
        {
            return Err(SwapError::IncorrectSwapAccount.into());
        }
        if *ctx.accounts.swap_source.to_account_info().key
            == *ctx.accounts.swap_destination.to_account_info().key
        {
            return Err(SwapError::InvalidInput.into());
        }
        if ctx.accounts.swap_source.to_account_info().key == ctx.accounts.source_info.key {
            return Err(SwapError::InvalidInput.into());
        }
        if ctx.accounts.swap_destination.to_account_info().key == ctx.accounts.destination_info.key
        {
            return Err(SwapError::InvalidInput.into());
        }
        if *ctx.accounts.pool_mint.to_account_info().key != pool.pool_mint {
            return Err(SwapError::IncorrectPoolMint.into());
        }
        if *ctx.accounts.token_program.key != pool.token_program_id {
            return Err(SwapError::IncorrectTokenProgramId.into());
        }

        let trade_direction =
            if *ctx.accounts.swap_source.to_account_info().key == pool.token_a_account {
                TradeDirection::AtoB
            } else {
                TradeDirection::BtoA
            };

        let (swap_token_a_amount, swap_token_b_amount) = match trade_direction {
            TradeDirection::AtoB => (amount_in, amount_in.checked_mul(10).unwrap()),
            TradeDirection::BtoA => (amount_in, amount_in.checked_div(10).unwrap()),
        };

        let seeds = &[
            &pool.to_account_info().key.to_bytes(),
            &[pool.bump_seed][..],
        ];

        token::transfer(
            ctx.accounts
                .into_transfer_to_swap_source_context()
                .with_signer(&[&seeds[..]]),
            swap_token_b_amount,
        )?;

        token::transfer(
            ctx.accounts
                .into_transfer_to_destination_context()
                .with_signer(&[&seeds[..]]),
            swap_token_a_amount,
        )?;

        Ok(())
    }
}

#[cfg(test)]
mod tests { 
    use super::*;

    // #[test]
    // fn intialize() {
    //     let program_id = Pubkey::default();
    //     let key = Pubkey::default();
    //     let owner = Pubkey::default();
    //     let token_a = TokenAccount::default();
    //     let token_b = TokenAccount::default();
    //     let init = Initialize();
    // }
}
