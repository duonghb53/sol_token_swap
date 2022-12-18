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
  let authority: PublicKey;
  let bumpSeed: number;
  let tokenPool: Token;
  let tokenAccountPool: PublicKey;
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

  const program = anchor.workspace.TokenSwap as Program<TokenSwap>;

  it("Initialize Pool!", async () => {
    // Add your test here.
    const sig = await provider.connection.requestAirdrop(
      payer.publicKey,
      1000000000
    );
    await provider.connection.confirmTransaction(sig, "singleGossip");

    [authority, bumpSeed] = await PublicKey.findProgramAddressSync(
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
    const tx = await program.rpc.initializePool({
      accounts: {
        swapAuthority: authority,
        pool: poolAccount.publicKey,
        tokenA: tokenAccountA,
        tokenB: tokenAccountB,
        poolMint: tokenPool.publicKey,
        destination: tokenAccountPool,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      instructions: [await program.account.pool.createInstruction(poolAccount)],
      signers: [poolAccount],
    });

    let fetchedpoolAccount = await program.account.pool.fetch(
      poolAccount.publicKey
    );

    console.log("Your transaction signature", tx);
    // console.log("fetchedpoolAccount", fetchedpoolAccount);
    assert(fetchedpoolAccount.tokenAAccount.equals(tokenAccountA));
    assert(fetchedpoolAccount.tokenBAccount.equals(tokenAccountB));
    assert(fetchedpoolAccount.tokenAMint.equals(mintA.publicKey));
    assert(fetchedpoolAccount.tokenBMint.equals(mintB.publicKey));
    // assert(fetchedpoolAccount.poolMint.equals(tokenPool.publicKey));
  });

  it("Deposit Token!", async () => {
    // Pool token amount to deposit on one side
    const depositAmount = 10000;

    const poolMintInfo = await tokenPool.getMintInfo();
    const supply = (poolMintInfo.supply as anchor.BN).toNumber();
    const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
    const poolTokenAAmount = depositAmount;
    const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
    const poolTokenBAmount = swapTokenB.amount as anchor.BN;

    const userTransferAuthority = anchor.web3.Keypair.generate();
    // Creating depositor token a account
    const userAccountA = await mintA.createAccount(owner.publicKey);
    await mintA.mintTo(userAccountA, owner, [], depositAmount);
    await mintA.approve(
      userAccountA,
      userTransferAuthority.publicKey,
      owner,
      [],
      depositAmount
    );
    // Creating depositor token b account
    const userAccountB = await mintB.createAccount(owner.publicKey);
    await mintB.mintTo(userAccountB, owner, [], depositAmount);
    await mintB.approve(
      userAccountB,
      userTransferAuthority.publicKey,
      owner,
      [],
      depositAmount
    );
    // Creating depositor pool token account
    const newAccountPool = await tokenPool.createAccount(owner.publicKey);

    // Depositing token A into swap
    await program.rpc.depositToken(new anchor.BN(depositAmount), {
      accounts: {
        pool: poolAccount.publicKey,
        swapAuthority: authority,
        user: userTransferAuthority.publicKey,
        source: userAccountA,
        swapTokenA: tokenAccountA,
        swapTokenB: tokenAccountB,
        poolMint: tokenPool.publicKey,
        destination: newAccountPool,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [userTransferAuthority],
    });

    let info;
    info = await mintA.getAccountInfo(userAccountA);
    assert(info.amount.toNumber() == 0);
    info = await mintA.getAccountInfo(tokenAccountA);
    assert(info.amount.toNumber() == currentSwapTokenA + depositAmount);
    currentSwapTokenA += depositAmount;

    // // Depositing token B into swap
    // await program.rpc.depositToken(new anchor.BN(depositAmount), {
    //   accounts: {
    //     pool: poolAccount.publicKey,
    //     swapAuthority: authority,
    //     user: userTransferAuthority.publicKey,
    //     source: userAccountB,
    //     swapTokenA: tokenAccountA,
    //     swapTokenB: tokenAccountB,
    //     poolMint: tokenPool.publicKey,
    //     destination: newAccountPool,
    //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   },
    //   signers: [userTransferAuthority],
    // });

    // info = await mintB.getAccountInfo(userAccountB);
    // assert(info.amount.toNumber() == 0);
    // info = await mintB.getAccountInfo(tokenAccountB);
    // assert(info.amount.toNumber() == currentSwapTokenB + depositAmount);
    // currentSwapTokenB += depositAmount;
    // info = await tokenPool.getAccountInfo(newAccountPool);
    // assert(info.amount.toNumber() >= poolTokenAAmount + poolTokenBAmount);
  });

  it("Swap", async () => {
    // Creating swap token a account
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

    let poolAccountToken = await tokenPool.createAccount(owner.publicKey);

    await program.methods
      .swap(new anchor.BN(SWAP_AMOUNT_IN))
      .accounts({
        swapAuthority: authority,
        pool: poolAccount.publicKey,
        user: userTransferAuthority.publicKey,
        sourceInfo: userAccountA,
        destinationInfo: userAccountB,
        swapSource: tokenAccountA,
        swapDestination: tokenAccountB,
        poolMint: tokenPool.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([userTransferAuthority])
      .rpc();

    let info;
    info = await mintA.getAccountInfo(userAccountA);
    console.log(`userAccountA: ${info.amount.toNumber()}`);

    info = await mintB.getAccountInfo(userAccountB);
    console.log(`userAccountB: ${info.amount.toNumber()}`);
    // assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

    info = await mintA.getAccountInfo(tokenAccountA);
    console.log(`tokenAccountA: ${info.amount.toNumber()}`);
    // assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
    currentSwapTokenA += SWAP_AMOUNT_IN;

    info = await mintB.getAccountInfo(tokenAccountB);
    console.log(`tokenAccountB: ${info.amount.toNumber()}`);
    // assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
    currentSwapTokenB -= SWAP_AMOUNT_OUT;

    await mintB.mintTo(userAccountB, owner, [], SWAP_AMOUNT_IN);
    await mintB.approve(
      userAccountB,
      userTransferAuthority.publicKey,
      owner,
      [],
      SWAP_AMOUNT_IN
    );
    await program.methods
      .swap(new anchor.BN(SWAP_AMOUNT_IN))
      .accounts({
        swapAuthority: authority,
        pool: poolAccount.publicKey,
        user: userTransferAuthority.publicKey,
        sourceInfo: userAccountB,
        destinationInfo: userAccountA,
        swapSource: tokenAccountB,
        swapDestination: tokenAccountA,
        poolMint: tokenPool.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([userTransferAuthority])
      .rpc();

    info = await mintA.getAccountInfo(userAccountA);
    console.log(`userAccountA: ${info.amount.toNumber()}`);

    // assert(info.amount.toNumber() == 0);

    info = await mintB.getAccountInfo(userAccountB);
    console.log(`userAccountB: ${info.amount.toNumber()}`);
    //assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

    info = await mintA.getAccountInfo(tokenAccountA);
    console.log(`tokenAccountA: ${info.amount.toNumber()}`);
    // assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
    currentSwapTokenA += SWAP_AMOUNT_IN;

    info = await mintB.getAccountInfo(tokenAccountB);
    console.log(`tokenAccountB: ${info.amount.toNumber()}`);
    // assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
    currentSwapTokenB -= SWAP_AMOUNT_OUT;
  });
});
