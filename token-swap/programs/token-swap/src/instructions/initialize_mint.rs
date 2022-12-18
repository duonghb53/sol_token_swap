use crate::*;

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    pub pool: Box<Account<'info, Pool>>,
    /// CHECK: Safe
    pub swap_authority: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_a_mint: Account<'info, token::Mint>,
    #[account(
      init_if_needed,
      payer = user,
      associated_token::mint = token_a_mint,
      associated_token::authority = user
    )]
    pub token_account: Account<'info, token::TokenAccount>,

    // Program
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, InitializeMint<'info>>,
    amount: u64,
) -> Result<()> {
    if !ctx.accounts.pool.is_initialized {
        return Err(SwapError::PoolIsNotInitilized.into());
    }

    let seeds: &[&[&[u8]]] = &[&[
        &ctx.accounts.pool.to_account_info().key.to_bytes(),
        &[ctx.accounts.pool.bump_seed][..],
    ]];

    let mint_to_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token::MintTo {
            mint: ctx.accounts.token_a_mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.token_a_mint.to_account_info(),
        },
        seeds,
    );

    token::mint_to(mint_to_ctx, amount)?;

    Ok(())
}
