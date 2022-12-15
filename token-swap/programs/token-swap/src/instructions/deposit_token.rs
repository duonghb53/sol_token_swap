use crate::*;

#[derive(Accounts)]
pub struct DepositToken<'info> {
    /// CHECK: Safe
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    /// CHECK: Safe
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, DepositToken<'info>>,
    amount: u64,
) -> Result<()> {
    // if ctx.accounts.source != ctx.accounts.swap_token_a
    //     || ctx.accounts.source != ctx.accounts.swap_token_b
    // {
    //     return Err(SwapError::InvalidInput.into());
    // }

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.source.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    );

    token::transfer(transfer_ctx, amount)?;

    Ok(())
}
