use crate::*;

#[derive(Accounts)]
pub struct DepositToken<'info> {
    pub pool: Box<Account<'info, Pool>>,
    /// CHECK: Safe
    pub swap_authority: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
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
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.source.to_account_info(),
            to: ctx.accounts.swap_token_a.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );

    token::transfer(transfer_ctx, amount)?;

    Ok(())
}
