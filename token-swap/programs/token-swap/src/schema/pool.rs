use crate::*;

#[account]
pub struct Pool {
    /// Is the swap initialized, with data written to it
    pub is_initialized: bool,
    /// Bump seed used to generate the program address / authority
    pub bump_seed: u8,
    /// Address of token A liquidity account
    pub token_a_account: Pubkey,
    /// Address of token B liquidity account
    pub token_b_account: Pubkey,
    /// Address of pool token mint
    pub pool_mint: Pubkey,
    /// Address of token A mint
    pub token_a_mint: Pubkey,
    /// Address of token B mint
    pub token_b_mint: Pubkey,
}

impl Pool {
    pub const SIZE: usize = 8 + 1 + 1 + 32 + 32 + 32 + 32 + 32;
}