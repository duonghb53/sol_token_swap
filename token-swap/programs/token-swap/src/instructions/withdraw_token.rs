use crate::*;

#[derive(Accounts)]
pub struct WithdrawToken<'info> {
    pub swap_authority: Signer<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, WithdrawToken<'info>>,
    amount: u64,
) -> Result<()> {
    // if token_withdraw != ctx.accounts.swap_token_a.to_account_info().key.clone()
    //     || token_withdraw != ctx.accounts.swap_token_b.to_account_info().key.clone()
    // {
    //     return Err(SwapError::InvalidInput.into());
    // }

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.destination.to_account_info(),
            to: ctx.accounts.source.to_account_info(),
            authority: ctx.accounts.swap_authority.to_account_info(),
        },
    );

    token::transfer(transfer_ctx, amount)?;
    Ok(())
}
