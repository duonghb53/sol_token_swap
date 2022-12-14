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
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import logo from "static/images/solanaLogo.svg";
import brand from "static/images/solanaLogoMark.svg";
import "./index.less";

const { Option } = Select;
const selectAfter = (
  <Select defaultValue="--Select--" style={{ width: 100 }}>
    <Option value="Solana">SOL</Option>
    <Option value="Reminato">REMI</Option>
    <Option value="Other">--Select--</Option>
  </Select>
);

function Swap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [balanceToken, setBalanceToken] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const swap_token = useCallback(async () => {
    try {
      setLoading(true);
      if (publicKey) {
        //Create a "transfer" instruction
        const instruction = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(
            "4wWCGESsiqnpb6W78kPWnXZCTLocpuS2U71Gfa8VAXur"
          ),
          lamports: LAMPORTS_PER_SOL / 100,
        });
        // Create a transaction and add the instruction intot it
        const transaction = new Transaction().add(instruction);
        // Wrap on-chain info to the transaction
        const {
          context: { slot: minContextSlot },
          value: { blockhash, lastValidBlockHeight },
        } = await connection.getLatestBlockhashAndContext();
        // Send and wait for the transaction confirmed
        const signature = await sendTransaction(transaction, connection, {
          minContextSlot,
        });
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });
        // let keys = [{ pubkey: publicKey, isSigner: true, isWritable: true }];
        // const custom_instruction = new TransactionInstruction({
        //   keys,
        //   programId: new PublicKey(PROGRAM_ID),
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
      <Typography.Title level={2}>Swap Token</Typography.Title>
      <Typography.Title level={3}>
        Solana: {balance / LAMPORTS_PER_SOL} SOL
      </Typography.Title>
      <Typography.Title level={3}>
        Token: {balanceToken.toLocaleString()} REMI
      </Typography.Title>
      <Form
      // labelCol={{ span: 4 }}
      // wrapperCol={{ span: 14 }}
      // layout="horizontal"
      >
        <Form.Item label="">
          <InputNumber addonAfter={selectAfter} size="large" />
        </Form.Item>
        <Form.Item label="">
          <InputNumber addonAfter={selectAfter} size="large" />
        </Form.Item>
        <Form.Item label="">
          <Button
            type="primary"
            size="large"
            style={{ width: 200, height: 50 }}
            onClick={swap_token}
            loading={loading}
          >
            Swap
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
}

export default Swap;
