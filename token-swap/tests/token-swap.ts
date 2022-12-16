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
  const TRADING_FEE_NUMERATOR = 25;
  const TRADING_FEE_DENOMINATOR = 10000;

  const poolAccount = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  const owner = anchor.web3.Keypair.generate();
  let treasurer: anchor.web3.PublicKey;
  const proposal = new anchor.web3.Keypair();

  const program = anchor.workspace.TokenSwap as Program<TokenSwap>;
  const splProgram = Spl.token(provider);

  // it("Initialized Mint", async () => {
  //   const amount = new anchor.BN(100);
  //   const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("mint"), provider.wallet.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const tokenAccount = await anchor.utils.token.associatedAddress({
  //     mint,
  //     owner: provider.wallet.publicKey,
  //   });

  //   const poolAccount = await anchor.utils.token.associatedAddress({
  //     mint,
  //     owner: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //   });

  //   // Add your test here.
  //   const tx = await program.methods
  //     .initialize(amount)
  //     .accounts({
  //       user: provider.wallet.publicKey,
  //       mint,
  //       tokenAccount,
  //       // poolAccount,
  //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);

  //   const tokenAccountData = await splProgram.account.token.fetch(tokenAccount);
  //   console.log("tokenAccountData", tokenAccountData.amount.toNumber());
  // });

  // it("Transfer!", async () => {
  //   const amount = new anchor.BN(30);
  //   const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("mint"), provider.wallet.publicKey.toBuffer()],
  //     program.programId
  //   );

  //   const receiver = anchor.web3.Keypair.generate().publicKey;

  //   const poolAccount = await anchor.utils.token.associatedAddress({
  //     mint,
  //     owner: program.programId,
  //   });

  //   const srcTokenAccount = await anchor.utils.token.associatedAddress({
  //     mint,
  //     owner: provider.wallet.publicKey,
  //   });
  //   const dstTokenAccount = await anchor.utils.token.associatedAddress({
  //     mint,
  //     owner: receiver,
  //   });

  //   // Add your test here.
  //   const tx = await program.methods
  //     .transfer(amount)
  //     .accounts({
  //       user: provider.wallet.publicKey,
  //       receiver,
  //       mint,
  //       srcTokenAccount,
  //       dstTokenAccount,
  //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
  //       associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);

  //   const srcTokenAccountData = await splProgram.account.token.fetch(
  //     srcTokenAccount
  //   );
  //   console.log("srcTokenAccount", srcTokenAccountData.amount.toNumber());

  //   const dstTokenAccountData = await splProgram.account.token.fetch(
  //     dstTokenAccount
  //   );
  //   console.log("dstTokenAccountData", dstTokenAccountData.amount.toNumber());
  // });

  it("Initialize Pool!", async () => {
    // Add your test here.
    const sig = await provider.connection.requestAirdrop(
      payer.publicKey,
      1000000000
    );
    await provider.connection.confirmTransaction(sig, "singleGossip");

    const [treasurerPublicKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("treasurer"), proposal.publicKey.toBuffer()],
      program.programId
    );
    treasurer = treasurerPublicKey;

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

    // const tx = await program.methods
    //   .initializePool()
    //   .accounts(
    //     {
    //       authority: authority,
    //       pool: poolAccount.publicKey,
    //       tokenA: tokenAccountA,
    //       tokenB: tokenAccountB,
    //       destination: tokenAccountPool,
    //       tokenProgram: TOKEN_PROGRAM_ID,
    //     }
    //     // instructions: [await program.account.pool.createInstruction(poolAccount)]
    //     // signers: [poolAccount]
    //   )
    //   .signers([poolAccount])
    //   .rpc();

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
    const tradingTokensToPoolTokens = (
      sourceAmount: number,
      swapSourceAmount: number,
      poolAmount: number
    ): number => {
      const tradingFee =
        (sourceAmount / 2) * (TRADING_FEE_NUMERATOR / TRADING_FEE_DENOMINATOR);
      const sourceAmountPostFee = sourceAmount - tradingFee;
      const root = Math.sqrt(sourceAmountPostFee / swapSourceAmount + 1);
      return Math.floor(poolAmount * (root - 1));
    };

    // Pool token amount to deposit on one side
    const depositAmount = 10000;

    const poolMintInfo = await tokenPool.getMintInfo();
    const supply = (poolMintInfo.supply as anchor.BN).toNumber();
    const swapTokenA = await mintA.getAccountInfo(tokenAccountA);
    const poolTokenAAmount = tradingTokensToPoolTokens(
      depositAmount,
      (swapTokenA.amount as anchor.BN).toNumber(),
      supply
    );
    const swapTokenB = await mintB.getAccountInfo(tokenAccountB);
    const poolTokenBAmount = tradingTokensToPoolTokens(
      depositAmount,
      (swapTokenB.amount as anchor.BN).toNumber(),
      supply
    );

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

    // Depositing token B into swap
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

    // const tx = await program.rpc.depositToken(new anchor.BN(SWAP_AMOUNT_IN), {
    //   accounts: {
    //     swapAuthority: authority,
    //     user: userTransferAuthority.publicKey,
    //     source: tokenAccountA,
    //     swapTokenA: tokenAccountA,
    //     swapTokenB: tokenAccountB,
    //     poolMint: tokenPool.publicKey,
    //     destination: poolAccount.publicKey,
    //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
    //     associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   },
    //   signers: [userTransferAuthority],
    // });
  });

  // it("Swap", async () => {
  //   // Creating swap token a account
  //   // creating token A
  //   mintA = await Token.createMint(
  //     provider.connection,
  //     payer,
  //     owner.publicKey,
  //     null,
  //     2,
  //     TOKEN_PROGRAM_ID
  //   );

  //   // creating token A account
  //   tokenAccountA = await mintA.createAccount(authority);
  //   // minting token A to swap
  //   await mintA.mintTo(tokenAccountA, owner, [], currentSwapTokenA);

  //   // creating token B
  //   mintB = await Token.createMint(
  //     provider.connection,
  //     payer,
  //     owner.publicKey,
  //     null,
  //     2,
  //     TOKEN_PROGRAM_ID
  //   );

  //   // creating token B account
  //   tokenAccountB = await mintB.createAccount(authority);
  //   // minting token B to swap
  //   await mintB.mintTo(tokenAccountB, owner, [], currentSwapTokenB);
  //   let userAccountA = await mintA.createAccount(owner.publicKey);
  //   await mintA.mintTo(userAccountA, owner, [], SWAP_AMOUNT_IN);
  //   const userTransferAuthority = anchor.web3.Keypair.generate();
  //   await mintA.approve(
  //     userAccountA,
  //     userTransferAuthority.publicKey,
  //     owner,
  //     [],
  //     SWAP_AMOUNT_IN
  //   );
  //   // Creating swap token b account
  //   let userAccountB = await mintB.createAccount(owner.publicKey);

  //   const tx = await program.rpc.initialize({
  //     accounts: {
  //       authority: authority,
  //       pool: poolAccount.publicKey,
  //       tokenA: tokenAccountA,
  //       tokenB: tokenAccountB,
  //       poolMint: tokenPool.publicKey,
  //       destination: tokenAccountPool,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     },
  //     instructions: [await program.account.pool.createInstruction(poolAccount)],
  //     signers: [poolAccount],
  //   });
  //   console.log("Your transaction signature", tx);

  //   // Swapping
  //   await program.rpc.swap(
  //     new anchor.BN(SWAP_AMOUNT_IN),
  //     {
  //       accounts: {
  //         authority: authority,
  //         pool: poolAccount.publicKey,
  //         userTransferAuthority: userTransferAuthority.publicKey,
  //         sourceInfo: userAccountA,
  //         destinationInfo: userAccountB,
  //         swapSource: tokenAccountA,
  //         swapDestination: tokenAccountB,
  //         poolMint: tokenPool.publicKey,
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //       },
  //       signers: [userTransferAuthority],
  //     }
  //   );

  //   let info;
  //   info = await mintA.getAccountInfo(userAccountA);
  //   assert(info.amount.toNumber() == 0);

  //   info = await mintB.getAccountInfo(userAccountB);
  //   assert(info.amount.toNumber() == SWAP_AMOUNT_OUT);

  //   info = await mintA.getAccountInfo(tokenAccountA);
  //   assert(info.amount.toNumber() == currentSwapTokenA + SWAP_AMOUNT_IN);
  //   currentSwapTokenA += SWAP_AMOUNT_IN;

  //   info = await mintB.getAccountInfo(tokenAccountB);
  //   assert(info.amount.toNumber() == currentSwapTokenB - SWAP_AMOUNT_OUT);
  //   currentSwapTokenB -= SWAP_AMOUNT_OUT;

  //   info = await tokenPool.getAccountInfo(tokenAccountPool);
  //   assert(
  //     info.amount.toNumber() == DEFAULT_POOL_TOKEN_AMOUNT - POOL_TOKEN_AMOUNT
  //   );
  // })
});
