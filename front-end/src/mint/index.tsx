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
  Space,
  Typography,
  Button,
  Form,
  InputNumber,
  Select,
} from "antd";

import { useCallback, useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import logo from "static/images/solanaLogo.svg";
import "./index.less";

const { Option } = Select;
const selectAfter = (
  <Select defaultValue="--Select--" style={{ width: 100 }}>
    <Option value="Solana">SOL</Option>
    <Option value="Reminato">REMI</Option>
    <Option value="Other">--Select--</Option>
  </Select>
);

function Mint() {
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

  const mint_token = useCallback(async () => {
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
      <Typography.Title level={2}>Mint Token</Typography.Title>
      <Typography.Title level={3}>
        Solana: {balance / LAMPORTS_PER_SOL} SOL
      </Typography.Title>
      <Typography.Title level={3}>
        Token: {balanceToken.toLocaleString()}
      </Typography.Title>
      <Form>
        <Form.Item label="Amount">
          <InputNumber style={{ width: 200 }} size="large" />
        </Form.Item>
        <Button
          type="primary"
          size="large"
          style={{ width: 200, height: 50 }}
          onClick={mint_token}
          loading={loading}
        >
          Mint
        </Button>
      </Form>
    </Space>
  );
}

export default Mint;
