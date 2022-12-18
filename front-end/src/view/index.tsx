import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { Col, Layout, Row, Button, Menu } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import { useState } from "react";

import brand from "static/images/solanaLogoMark.svg";
import "./index.less";
import Swap from "swap";
import Deposit from "deposit";
import Mint from "mint";

const componentsSwitch = (key: String) => {
  switch (key) {
    case "1":
      return <Deposit />;
    case "2":
      return <Swap />;
    case "3":
      return <Mint />;
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
        <Col style={{ width: 200 }}>
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
            <Menu.Item key="3">Mint Token</Menu.Item>
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
