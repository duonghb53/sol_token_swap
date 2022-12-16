use crate::schema::*;
use crate::*;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    /// CHECK: Safe
    pub swap_authority: AccountInfo<'info>,
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

impl<'info> InitializePool<'info> {
    pub fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.pool_mint.to_account_info(),
            to: self.destination.to_account_info(),
            authority: self.swap_authority.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn exec<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, InitializePool<'info>>,
) -> Result<()> {
    let (swap_authority, bump_seed) = Pubkey::find_program_address(
        &[&ctx.accounts.pool.to_account_info().key.to_bytes()],
        ctx.program_id,
    );
    let seeds = &[
        &ctx.accounts.pool.to_account_info().key.to_bytes(),
        &[bump_seed][..],
    ];

    if ctx.accounts.pool.is_initialized {
        return Err(SwapError::AlreadyInUse.into());
    }

    if *ctx.accounts.swap_authority.key != swap_authority {
        return Err(SwapError::InvalidProgramAddress.into());
    }
    if *ctx.accounts.swap_authority.key != ctx.accounts.token_a.owner {
        return Err(SwapError::InvalidOwner.into());
    }
    if *ctx.accounts.swap_authority.key != ctx.accounts.token_b.owner {
        return Err(SwapError::InvalidOwner.into());
    }
    if *ctx.accounts.swap_authority.key == ctx.accounts.destination.owner {
        return Err(SwapError::InvalidOutputOwner.into());
    }

    if ctx.accounts.token_a.mint == ctx.accounts.token_b.mint {
        return Err(SwapError::RepeatedMint.into());
    }

    token::mint_to(
        ctx.accounts
            .into_mint_to_context()
            .with_signer(&[&seeds[..]]),
        INITIAL_SWAP_POOL_AMOUNT,
    )?;

    let pool = &mut ctx.accounts.pool;
    pool.swap_authority = swap_authority;
    pool.is_initialized = true;
    pool.bump_seed = bump_seed;
    pool.token_a_account = *ctx.accounts.token_a.to_account_info().key;
    pool.token_b_account = *ctx.accounts.token_b.to_account_info().key;
    pool.pool_mint = *ctx.accounts.pool_mint.to_account_info().key;
    pool.token_a_mint = ctx.accounts.token_a.mint;
    pool.token_b_mint = ctx.accounts.token_b.mint;

    Ok(())
}
