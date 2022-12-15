use crate::*;

#[derive(Accounts)]
pub struct Swap<'info> {
    pub pool: Box<Account<'info, Pool>>,
    /// CHECK: Safe
    pub authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub source_info: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub destination_info: AccountInfo<'info>,
    #[account(mut)]
    pub swap_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// CHECK: Safe
    pub token_program: AccountInfo<'info>,
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, Swap<'info>>,
    amount_in: u64,
) -> Result<()> {
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
    if ctx.accounts.swap_destination.to_account_info().key == ctx.accounts.destination_info.key {
        return Err(SwapError::InvalidInput.into());
    }
    if *ctx.accounts.pool_mint.to_account_info().key != pool.pool_mint {
        return Err(SwapError::IncorrectPoolMint.into());
    }

    let trade_direction = if *ctx.accounts.swap_source.to_account_info().key == pool.token_a_account
    {
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

    // token::transfer(
    //     ctx.accounts
    //         .into_transfer_to_swap_source_context()
    //         .with_signer(&[&seeds[..]]),
    //     swap_token_b_amount,
    // )?;

    // token::transfer(
    //     ctx.accounts
    //         .into_transfer_to_destination_context()
    //         .with_signer(&[&seeds[..]]),
    //     swap_token_a_amount,
    // )?;

    Ok(())
}
