use crate::*;

#[derive(Accounts)]
pub struct Swap<'info> {
    /// CHECK: Safe
    pub authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(signer)]
    pub user_transfer_authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub source_info: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub destination_info: AccountInfo<'info>,
    #[account(mut)]
    pub swap_source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub swap_destination: Account<'info, TokenAccount>,
    /// CHECK: Safe
    pub token_program: AccountInfo<'info>,
}