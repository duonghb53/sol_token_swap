use crate::*;

#[derive(Accounts)]
#[instruction(amount:u64)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
      init,
      payer = user,
      space = Pool::SIZE,
  )]
    pub pool: Account<'info, Pool>,

    #[account(
      init,
      seeds = [
        b"mint",
        user.key().as_ref(),
        &amount.to_le_bytes()
      ],
      bump,
      payer = user,
      mint::decimals = 9,
      mint::authority = mint,
  )]
    pub mint: Account<'info, token::Mint>,

    #[account(
      init_if_needed,
      payer = user,
      associated_token::mint = mint,
      associated_token::authority = user
  )]
    pub token_account: Account<'info, token::TokenAccount>,

    // Program
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

// pub fn exec(ctx: Context<InitializePool>, amount: u64) -> Result<()> {
//     let seeds: &[&[&[u8]]] = &[&[
//         "mint".as_ref(),
//         &ctx.accounts.user.key().to_bytes(),
//         &amount.to_le_bytes(),
//         &[*ctx.bumps.get("mint").unwrap()],
//     ]];

//     let mint_to_ctx = CpiContext::new_with_signer(
//         ctx.accounts.token_program.to_account_info(),
//         token::MintTo {
//             mint: ctx.accounts.mint.to_account_info(),
//             to: ctx.accounts.token_account.to_account_info(),
//             authority: ctx.accounts.mint.to_account_info(),
//         },
//         seeds,
//     );

//     token::mint_to(mint_to_ctx, amount)?;
//     Ok(())
// }
pub fn exec(ctx: Context<InitializePool>) -> Result<()> {
    ctx.accounts.pool.authority = ctx.accounts.token_program.to_account_info().key.clone();
    ctx.accounts.pool.token_a_account = ctx.accounts.token_program.to_account_info().key.clone();
    ctx.accounts.pool.token_a_amount = 0u64;
    ctx.accounts.pool.sol_amount = 0u64;

    Ok(())
}
