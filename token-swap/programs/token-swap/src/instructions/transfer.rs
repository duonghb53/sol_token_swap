use crate::*;

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Unnecessary
    pub receiver: AccountInfo<'info>,

    pub mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub src_token_account: Account<'info, token::TokenAccount>,
    #[account(
      init_if_needed,
      payer = user,
      associated_token::mint = mint,
      associated_token::authority = receiver
  )]
    pub dst_token_account: Account<'info, token::TokenAccount>,

    // Program
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, TransferToken<'info>>,
    amount: u64,
) -> Result<()> {
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        token::Transfer {
            from: ctx.accounts.src_token_account.to_account_info(),
            to: ctx.accounts.dst_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );

    token::transfer(transfer_ctx, amount)?;
    Ok(())
}
