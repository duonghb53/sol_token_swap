import * as anchor from "@project-serum/anchor";
import { Program, Spl } from "@project-serum/anchor";
import { TokenSwap } from "../target/types/token_swap";

const DECIMALS = 10 ** 9;

describe("token-swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenSwap as Program<TokenSwap>;
  const splProgram = Spl.token();

  it("Is initialized!", async () => {
    // Add your test here.
    const amount = new anchor.BN(100);
    const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("mint"),
        provider.wallet.publicKey.toBuffer(),
        amount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tokenAccount = await anchor.utils.token.associatedAddress({
      mint,
      owner: provider.wallet.publicKey,
    });

    // Add your test here.
    const tx = await program.methods
      .initialize(amount)
      .accounts({
        user: provider.wallet.publicKey,
        mint,
        tokenAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const tokenAccountData = await splProgram.account.token.fetch(tokenAccount);

    console.log("Your transaction signature", tx);
    console.log("tokenAccount", tokenAccountData.amount.toString());
    // console.log("program", program.account.toString());
  })

  it("Is Deposit Token!", async () => {
    // Add your test here.
    const amount = new anchor.BN(30);
    const receiver = anchor.web3.Keypair.generate().publicKey;

    const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("mint"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    const srcTokenAccount = await anchor.utils.token.associatedAddress({
      mint,
      owner: provider.wallet.publicKey,
    });
    const dstTokenAccount = await anchor.utils.token.associatedAddress({
      mint,
      owner: receiver,
    });

    // Add your test here.
    const tx = await program.methods
      .depositToken(amount)
      .accounts({
        user: provider.wallet.publicKey,
        receiver,
        mint,
        srcTokenAccount,
        dstTokenAccount,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const srcTokenAccountData = await splProgram.account.token.fetch(
      srcTokenAccount
    );
    console.log("tokenAccount", srcTokenAccountData.amount.toString());
    const dstTokenAccountData = await splProgram.account.token.fetch(
      dstTokenAccount
    );
    console.log("tokenAccount", dstTokenAccountData.amount.toString());
  })
})
