import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const PostureAnalysis = () => (
  <Card title="Posture Analysis" style={{ maxWidth: '600px', margin: '0 auto' }}>
    <Title level={4}>Your Posture Analysis</Title>
    <Paragraph>
      This section will analyze your posture using sensor data and provide personalized feedback.
    </Paragraph>
  </Card>
);

export default PostureAnalysis;
