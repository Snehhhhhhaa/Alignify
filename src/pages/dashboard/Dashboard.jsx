import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { PieChartOutlined, UserOutlined, FileTextOutlined, CommentOutlined } from '@ant-design/icons';
import GoodPostureNote from './components/GoodPostureNote';
import UserProfile from './components/UserProfile';
import PostureAnalysis from './components/PostureAnalysis';
import Recommendations from './components/Recommendations';
import firebase from 'firebase/compat/app';

const { Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [selectedKey, setSelectedKey] = useState("note");

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  const renderContent = () => {
    switch(selectedKey) {
      case "note":
        return <GoodPostureNote />;
      case "profile":
        return <UserProfile />;
      case "analysis":
        return <PostureAnalysis />;
      case "recommendations":
        return <Recommendations />;
      default:
        return <GoodPostureNote />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sider style={{ height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ height: '32px', margin: '16px', color: '#fff', textAlign: 'center' }}>
          Posture Dashboard
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['note']} onClick={handleMenuClick}>
          <Menu.Item key="note" icon={<FileTextOutlined />}>Posture Note</Menu.Item>
          <Menu.Item key="profile" icon={<UserOutlined />}>User Profile</Menu.Item>
          <Menu.Item key="analysis" icon={<PieChartOutlined />}>Posture Analysis</Menu.Item>
          <Menu.Item key="recommendations" icon={<CommentOutlined />}>Recommendations</Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ margin: '0', padding: '16px', minHeight: '100vh', overflow: 'auto' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
