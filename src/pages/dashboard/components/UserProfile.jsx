import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const UserProfile = () => (
  <Card title="User Profile" style={{ maxWidth: '600px', margin: '0 auto' }}>
    <Title level={4}>John Doe</Title>
    <Paragraph>Email: john.doe@example.com</Paragraph>
    <Paragraph>Member Since: January 2023</Paragraph>
  </Card>
);

export default UserProfile;
