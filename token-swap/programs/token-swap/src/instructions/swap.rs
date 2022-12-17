use crate::*;

#[derive(Accounts)]
pub struct Swap<'info> {
    pub pool: Box<Account<'info, Pool>>,
    /// CHECK: Safe
    pub swap_authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub user: Signer<'info>,
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
    // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Swap<'info> {
    pub fn transfer_from_token_to_pool(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.swap_source.to_account_info().clone(),
            to: self.destination_info.to_account_info().clone(),
            authority: self.user.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }

    pub fn transfer_from_pool_to_user(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.destination_info.to_account_info().clone(),
            to: self.swap_destination.to_account_info().clone(),
            authority: self.swap_authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, Swap<'info>>,
    amount_in: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    if pool.to_account_info().owner != ctx.program_id {
        return Err(ProgramError::IncorrectProgramId.into());
    }

    if *ctx.accounts.swap_authority.key
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
    // if *ctx.accounts.pool_mint.to_account_info().key != pool.pool_mint {
    //     return Err(SwapError::IncorrectPoolMint.into());
    // }

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

    // Transfer token out from Pool to User
    token::transfer(
        ctx.accounts.transfer_from_token_to_pool(),
        swap_token_a_amount,
    )?;

    token::transfer(
        ctx.accounts
            .transfer_from_pool_to_user()
            .with_signer(&[&seeds[..]]),
        swap_token_b_amount,
    )?;

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
