use crate::*;

#[derive(Accounts)]
pub struct DepositToken<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: Unnecessary
    pub receiver: AccountInfo<'info>,

    pub mint: Account<'info, token::Mint>,

    #[account(mut)]
    pub src_token_account: Account<'info, TokenAccount>,
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

// impl<'info> DepositToken<'info> {
//     fn deposit_token(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
//         let cpi_accounts = Transfer {
//             from: self.source_a_info.clone(),
//             to: self.destination.to_account_info().clone(),
//             authority: self.user_transfer_authority_info.clone(),
//         };
//         CpiContext::new(self.token_program.clone(), cpi_accounts)
//     }
// }

pub fn exec<'a, 'b, 'c, 'd, 'info>(
    ctx: Context<'a, 'b, 'c, 'd, DepositToken<'info>>,
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
