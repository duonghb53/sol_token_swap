import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import { struct, u32, ns64 } from "@solana/buffer-layout";

import {
  Image,
  Col,
  Layout,
  Row,
  Space,
  Typography,
  Button,
  Form,
  InputNumber,
  Select,
  Menu,
  MenuProps,
} from "antd";

import { useCallback, useEffect, useState } from "react";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  createMint,
  createAccount,
  transfer,
  NATIVE_MINT,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import logo from "static/images/solanaLogo.svg";
import brand from "static/images/solanaLogoMark.svg";
import "./index.less";
import { Program, Spl, utils, web3, workspace } from "@project-serum/anchor";
import { TokenSwap } from "configs/token_swap";

const { Option } = Select;

//when we only want to view vaults, no need to connect a real wallet.
export function createFakeWallet() {
  const leakedKp = Keypair.fromSecretKey(
    Uint8Array.from([
      98, 70, 37, 104, 229, 202, 126, 222, 93, 126, 61, 123, 221, 5, 161, 82,
      161, 223, 125, 248, 126, 32, 149, 253, 85, 133, 65, 230, 165, 50, 244,
      124, 126, 243, 96, 76, 11, 219, 87, 72, 98, 115, 75, 248, 146, 141, 136,
      245, 65, 184, 22, 10, 210, 240, 212, 174, 106, 31, 81, 44, 45, 115, 90,
      44,
    ])
  );
  return leakedKp;
}

function Deposit() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [balanceToken, setBalanceToken] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOptionItem, setSelectedOptionItem] = useState("SOL");
  const setTokenDeposit = (value: string) => {
    console.log(value);
    setSelectedOptionItem(value);
    console.log(selectedOptionItem);
  };

  const selectAfter = (
    <Select
      defaultValue="--Select--"
      style={{ width: 100 }}
      onChange={setTokenDeposit}
    >
      <Option value="SOL">SOL</Option>
      <Option value="REMI">REMI</Option>
      <Option value="Other">--Select--</Option>
    </Select>
  );

  const getMyBalance = useCallback(async () => {
    if (!publicKey) return setBalance(0);
    // Read on-chain balance
    const lamports = await connection.getBalance(publicKey);
    return setBalance(lamports);
  }, [connection, publicKey]);

  const getMyBalanceToken = useCallback(async () => {
    if (!publicKey) return setBalanceToken(0);
    const tokenAccount = new PublicKey(
      "mmLLL2c2Uv3irYJFk3mLmSKa8zfy2ERkd9tXDAgwpym"
    );

    // Read on-chain balance
    let tokenAmount = await connection.getTokenAccountBalance(tokenAccount);
    console.log(`amount: ${tokenAmount.value.uiAmount}`);
    console.log(`decimals: ${tokenAmount.value.decimals}`);

    return setBalanceToken(Number(tokenAmount.value.uiAmount));
  }, [connection, publicKey]);

  const InitializePool = async () => {
    if (publicKey) {
      const program = workspace.TokenSwap as Program<TokenSwap>;
      const poolAccount = createFakeWallet();
      const [authority, bumpSeed] = await PublicKey.findProgramAddressSync(
        [poolAccount.publicKey.toBuffer()],
        program.programId
      );

      // // creating pool mint
      const mintInfo = await getMint(
        connection,
        new PublicKey("7Ss1ZHCFJTUxiE4oMhE42Kb3iYmhoU6UuVcSh8YxKqtC")
      );

      // // creating pool account
      // const fromTokenAccount = await getAccount(connection, publicKey);

      // // creating pool account
      const tokenAccountA = await createAccount(
        connection,
        poolAccount,
        mintInfo.address,
        authority
      );

      const tokenAccountPool = await createAccount(
        connection,
        poolAccount,
        mintInfo.address,
        poolAccount.publicKey
      );

      const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        authority
      );

      const tx = await program.rpc.initializePool({
        accounts: {
          swapAuthority: authority,
          pool: poolAccount.publicKey,
          tokenA: tokenAccountA,
          tokenB: associatedTokenAccount,
          poolMint: mintInfo.address,
          destination: tokenAccountPool,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        instructions: [
          await program.account.pool.createInstruction(poolAccount),
        ],
        signers: [poolAccount],
      });

      let fetchedpoolAccount = await program.account.pool.fetch(
        poolAccount.publicKey
      );

      console.log("Your transaction signature", tx);
      console.log("fetchedpoolAccount", fetchedpoolAccount);

      // // Transfer the new token to the "toTokenAccount" we just created
      // let signature = await transfer(
      //   connection,
      //   poolAccount,
      //   fromTokenAccount,
      //   tokenAccountA,
      //   poolAccount,
      //   1000
      // );

      // const tx = await program.rpc.initializePool({
      //   accounts: {
      //     swapAuthority: authority,
      //     pool: poolAccount.publicKey,
      //     tokenA: tokenAccountA,
      //     tokenB: tokenAccountB,
      //     poolMint: tokenPool.publicKey,
      //     destination: tokenAccountPool,
      //     tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      //     associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      //     systemProgram: anchor.web3.SystemProgram.programId,
      //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      //   },
      //   instructions: [await program.account.pool.createInstruction(poolAccount)],
      //   signers: [poolAccount],
      // });

      // let fetchedpoolAccount = await program.account.pool.fetch(
      //   poolAccount.publicKey
      // );
    }
  };

  const deposit_token = useCallback(async () => {
    try {
      setLoading(true);
      if (publicKey) {
        const mintInfo = await getMint(
          connection,
          new PublicKey("7Ss1ZHCFJTUxiE4oMhE42Kb3iYmhoU6UuVcSh8YxKqtC")
        );
        console.log(mintInfo);

        // const tokenAccountInfo = mintInfo.c(
        //   connection,
        //   publicKey
        // )

        // console.log(tokenAccountInfo.amount);

        const instruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "4wWCGESsiqnpb6W78kPWnXZCTLocpuS2U71Gfa8VAXur"
          ),
          lamports: LAMPORTS_PER_SOL / 100,
        });
        // const tokenAccount = await getOrCreateAssociatedTokenAccount(
        //   connection,
        //   wallet.,
        //   mintInfo.address,
        //   publicKey
        // )

        // console.log(tokenAccount.address.toBase58());

        // const programAccount = await
        // // Create a "transfer" instruction
        // const instruction = SystemProgram.transfer({
        //   fromPubkey: publicKey,
        //   toPubkey: new PublicKey(
        //     "4wWCGESsiqnpb6W78kPWnXZCTLocpuS2U71Gfa8VAXur"
        //   ),
        //   lamports: LAMPORTS_PER_SOL / 100,
        // });
        // // Create a transaction and add the instruction intot it
        // const transaction = new Transaction().add(instruction);
        // // Wrap on-chain info to the transaction
        // const {
        //   context: { slot: minContextSlot },
        //   value: { blockhash, lastValidBlockHeight },
        // } = await connection.getLatestBlockhashAndContext();
        // // Send and wait for the transaction confirmed
        // const signature = await sendTransaction(transaction, connection, {
        //   minContextSlot,
        // });
        // await connection.confirmTransaction({
        //   blockhash,
        //   lastValidBlockHeight,
        //   signature,
        // });

        // Reload balance
        return getMyBalance();
      }
    } catch (er: any) {
      console.log(er.message);
    } finally {
      return setLoading(false);
    }
  }, [connection, publicKey, getMyBalance, sendTransaction]);

  useEffect(() => {
    getMyBalance();
  }, [getMyBalance]);

  useEffect(() => {
    getMyBalanceToken();
  }, [getMyBalanceToken]);

  return (
    <Space direction="vertical" size={24}>
      <Image src={logo} preview={false} width={256} />
      <Typography.Title level={2}>Deposit Token</Typography.Title>
      <Typography.Title level={3}>
        Solana: {balance / LAMPORTS_PER_SOL} SOL
      </Typography.Title>
      <Typography.Title level={3}>
        Token: {balanceToken.toLocaleString()} REMI
      </Typography.Title>
      <Form>
        <Form.Item label="">
          <InputNumber addonAfter={selectAfter} size="large" />
        </Form.Item>
        <Form.Item label="">
          <Button
            type="primary"
            size="large"
            style={{ width: 200, height: 50 }}
            onClick={deposit_token}
            loading={loading}
          >
            Deposit
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={InitializePool}>
            Initialize Pool
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
}

export default Deposit;
