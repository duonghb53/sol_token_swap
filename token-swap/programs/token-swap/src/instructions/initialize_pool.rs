use crate::schema::*;
use crate::*;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    /// CHECK: Safe
    pub authority: AccountInfo<'info>,
    #[account(signer, zero)]
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    pub pool_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    // System Program Address
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn exec<'a, 'b, 'c, 'info>(ctx: Context<'a, 'b, 'c, 'info, InitializePool<'info>>) -> Result<()> {
    if ctx.accounts.pool.is_initialized {
        return Err(SwapError::AlreadyInUse.into());
    }

    msg!("Pool account: {:?}", &ctx.accounts.pool.to_account_info());

    let (swap_authority, bump_seed) = Pubkey::find_program_address(
        &[&ctx.accounts.pool.to_account_info().key.to_bytes()],
        ctx.program_id,
    );

    if *ctx.accounts.authority.key != swap_authority {
        return Err(SwapError::InvalidProgramAddress.into());
    }

    let pool = &mut ctx.accounts.pool;
    pool.is_initialized = true;
    pool.bump_seed = bump_seed;
    pool.token_a_account = *ctx.accounts.token_a.to_account_info().key;
    pool.token_b_account = *ctx.accounts.token_b.to_account_info().key;
    pool.pool_mint = *ctx.accounts.pool_mint.to_account_info().key;
    pool.token_a_mint = ctx.accounts.token_a.mint;
    pool.token_b_mint = ctx.accounts.token_b.mint;

    Ok(())
}
