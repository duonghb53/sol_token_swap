use crate::*;

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub token_a_account: Pubkey,
    pub token_a_amount: u64,
    pub sol_amount: u64,
}

impl Pool {
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 8;
}