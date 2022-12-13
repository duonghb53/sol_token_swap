use crate::*;

#[derive(Accounts)]
pub struct WithdrawToken<'info> {
    /// CHECK: Safe
    pub authority: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(signer)]
    pub user_transfer_authority_info: AccountInfo<'info>,
    /// CHECK: Safe
    #[account(mut)]
    pub source_info: AccountInfo<'info>,
    #[account(mut)]
    pub token_a: Account<'info, TokenAccount>,
    /// CHECK: Safe
    #[account(mut)]
    pub dest_token_a_info: AccountInfo<'info>,
    /// CHECK: Safe
    pub token_program: AccountInfo<'info>,
}

// impl<'info> WithdrawToken<'info> {
//     fn withdraw(&self) -> CpiContext<'_, '_, '_, 'info, WithdrawToken<'info>> {
//         let cpi_accounts = Transfer {
//             from: self.source_info.clone(),
//             to: self.authority.clone(),
//             authority: self.user_transfer_authority_info.clone(),
//         };
//         CpiContext::new(self.token_program.clone(), cpi_accounts)
//     }
// }