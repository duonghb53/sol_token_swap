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
  Grid,
  Divider,
} from "antd";
import {
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

import { useCallback, useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import logo from "static/images/solanaLogo.svg";
import brand from "static/images/solanaLogoMark.svg";
import "./index.less";
import Swap from "Swap";
import Deposit from "Deposit";

const { Option } = Select;
const selectAfter = (
  <Select defaultValue="--Select--" style={{ width: 100 }}>
    <Option value="Solana">SOL</Option>
    <Option value="Reminato">REMI</Option>
    <Option value="Other">--Select--</Option>
  </Select>
);

const componentsSwitch = (key: String) => {
  switch (key) {
    case "1":
      console.log(key);
      return <Deposit />;
    case "2":
      console.log(key);
      return <Swap />;
    default:
      return <Deposit />;
  }
};

function View() {
  const [selectedMenuItem, setSelectedMenuItem] = useState("1");
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col flex="auto">
              <img alt="logo" src={brand} height={16} />
            </Col>
            <Col>
              <WalletMultiButton />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
          <Col style={{width: 200}}>
            <Button
              type="primary"
              onClick={toggleCollapsed}
              style={{ marginBottom: 0 }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
              defaultSelectedKeys={["1"]}
              mode="vertical"
              onClick={(e) => setSelectedMenuItem(e.key)}
              theme="dark"
              inlineCollapsed={collapsed}
            >
              <Menu.Item key="1">Deposit</Menu.Item>
              <Menu.Item key="2">Swap</Menu.Item>
            </Menu>
          </Col>
          <Col span={18} style={{ textAlign: "center" }}>
            {componentsSwitch(selectedMenuItem)}
          </Col>
        </Row>
    </Layout>
  );
}

export default View;
