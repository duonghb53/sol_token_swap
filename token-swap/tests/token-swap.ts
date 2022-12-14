import * as anchor from "@project-serum/anchor";
import { Program, Spl } from "@project-serum/anchor";
import { TokenSwap } from "../target/types/token_swap";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { PublicKey, Connection, Commitment } from "@solana/web3.js";
import { assert } from "chai";

const DECIMALS = 10 ** 9;

describe("token-swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenSwap as Program<TokenSwap>;
  const splProgram = Spl.token();

  let authority: PublicKey;
  let bumpSeed: number;
  let tokenPool: Token;
  let tokenAccountPool: PublicKey;
  const SWAP_PROGRAM_OWNER_FEE_ADDRESS =
    process.env.SWAP_PROGRAM_OWNER_FEE_ADDRESS;
  let mintA: Token;
  let mintB: Token;
  let tokenAccountA: PublicKey;
  let tokenAccountB: PublicKey;
  // Initial amount in each swap token
  let currentSwapTokenA = 1000000;
  let currentSwapTokenB = 1000000;

  const DEFAULT_POOL_TOKEN_AMOUNT = 1000000000;
  // Pool token amount to withdraw / deposit
  const POOL_TOKEN_AMOUNT = 10000000;
  const SWAP_AMOUNT_IN = 100000;
  const SWAP_AMOUNT_OUT = 100000 / 10;

  const poolAccount = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  const owner = anchor.web3.Keypair.generate();

  it("Initialize Pool!", async () => {
    // Add your test here.
    const sig = await provider.connection.requestAirdrop(
      payer.publicKey,
      1000000000
    );
    await provider.connection.confirmTransaction(sig, "singleGossip");

    [authority, bumpSeed] = await PublicKey.findProgramAddress(
      [poolAccount.publicKey.toBuffer()],
      program.programId
    );

    // creating pool mint
    tokenPool = await Token.createMint(
      provider.connection,
      payer,
      authority,
      null,
      2,
      TOKEN_PROGRAM_ID
    );

    // creating pool account
    tokenAccountPool = await tokenPool.createAccount(owner.publicKey);

    // creating token A
    mintA = await Token.createMint(
      provider.connection,
      payer,
      owner.publicKey,
      null,
      2,
      TOKEN_PROGRAM_ID
    );

    // creating token A account
    tokenAccountA = await mintA.createAccount(authority);
    // minting token A to swap
    await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);

    // creating token B
    mintB = await Token.createMint(
      provider.connection,
      payer,
      owner.publicKey,
      null,
      2,
      TOKEN_PROGRAM_ID
    );

    // creating token B account
    tokenAccountB = await mintB.createAccount(authority);
    // minting token B to swap
    await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);

    const tx = await program.methods
    .initialize()
      .accounts({
        authority: authority,
        pool: poolAccount.publicKey,
        tokenA: tokenAccountA,
        tokenB: tokenAccountB,
        poolMint: tokenPool.publicKey,
        destination: tokenAccountPool,
        tokenProgram: TOKEN_PROGRAM_ID,
      }
      // instructions: [await program.account.pool.createInstruction(poolAccount)]
      // signers: [poolAccount]
      )
      .preInstructions([await program.account.pool.createInstruction(poolAccount)])
      .signers([poolAccount])
      .rpc();

    // const tx = await program.rpc.initialize({
    //   accounts: {
    //     authority: authority,
    //     pool: poolAccount.publicKey,
    //     tokenA: tokenAccountA,
    //     tokenB: tokenAccountB,
    //     poolMint: tokenPool.publicKey,
    //     destination: tokenAccountPool,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //   },
    //   instructions: [await program.account.pool.createInstruction(poolAccount)],
    //   signers: [poolAccount],
    // });
    

    // let fetchedpoolAccount = await program.account.pool.fetch(
    //   poolAccount.publicKey
    // );

    console.log("Your transaction signature", tx);
    // console.log("fetchedpoolAccount", fetchedpoolAccount);
    // assert(fetchedpoolAccount.tokenProgramId.equals(TOKEN_PROGRAM_ID));
    // assert(fetchedpoolAccount.tokenAAccount.equals(tokenAccountA));
    // assert(fetchedpoolAccount.tokenBAccount.equals(tokenAccountB));
    // assert(fetchedpoolAccount.tokenAMint.equals(mintA.publicKey));
    // assert(fetchedpoolAccount.tokenBMint.equals(mintB.publicKey));
    // assert(fetchedpoolAccount.poolMint.equals(tokenPool.publicKey));
  });

  it("Swap", async () => {
    // Creating swap token a account
    // creating token A
    mintA = await Token.createMint(
      provider.connection,
      payer,
      owner.publicKey,
      null,
      2,
      TOKEN_PROGRAM_ID
    );

    // creating token A account
    tokenAccountA = await mintA.createAccount(authority);
    // minting token A to swap
    await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);

    // creating token B
    mintB = await Token.createMint(
      provider.connection,
      payer,
      owner.publicKey,
      null,
      2,
      TOKEN_PROGRAM_ID
    );

    // creating token B account
    tokenAccountB = await mintB.createAccount(authority);
    // minting token B to swap
    await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);
    let userAccountA = await mintA.createAccount(owner.publicKey);
    await mintA.mintTo(userAccountA, owner, [], SWAP_AMOUNT_IN);
    const userTransferAuthority = anchor.web3.Keypair.generate();
    await mintA.approve(
      userAccountA,
      userTransferAuthority.publicKey,
      owner,
      [],
      SWAP_AMOUNT_IN
    );
    // Creating swap token b account
    let userAccountB = await mintB.createAccount(owner.publicKey);

    const tx = await program.rpc.initialize({
      accounts: {
        authority: authority,
        pool: poolAccount.publicKey,
        tokenA: tokenAccountA,
        tokenB: tokenAccountB,
        poolMint: tokenPool.publicKey,
        destination: tokenAccountPool,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [await program.account.pool.createInstruction(poolAccount)],
      signers: [poolAccount],
    });
    console.log("Your transaction signature", tx);

    // Swapping
    await program.rpc.swap(
      new anchor.BN(SWAP_AMOUNT_IN),
      new anchor.BN(SWAP_AMOUNT_OUT),
      {
        accounts: {
          authority: authority,
          pool: poolAccount.publicKey,
          userTransferAuthority: userTransferAuthority.publicKey,
          sourceInfo: userAccountA,
          destinationInfo: userAccountB,
          swapSource: tokenAccountA,
          swapDestination: tokenAccountB,
          poolMint: tokenPool.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [userTransferAuthority],
      }
    );

    let info;
    info = await mintA.getAccountInfo(userAccountA);
    assert(info.amount.toNumber() == 0);

    info = await mintB.getAccountInfo(userAccountB);
    assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

    info = await mintA.getAccountInfo(tokenAccountA);
    assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
    currentSwapTokenA += SWAP_AMOUNT_IN;

    info = await mintB.getAccountInfo(tokenAccountB);
    assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
    currentSwapTokenB -= SWAP_AMOUNT_OUT;

    info = await tokenPool.getAccountInfo(tokenAccountPool);
    assert(
      info.amount.toNumber() == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT
    );
  });
});
