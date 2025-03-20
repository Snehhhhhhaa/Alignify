
import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const GoodPostureNote = () => (
  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
    <Title level={3}>Keep a Good Posture</Title>
    <Paragraph>
      Remember to keep a straight back, relax your shoulders, and avoid slouching.
      Taking regular breaks and doing stretching exercises can help maintain a healthy posture.
    </Paragraph>
  </div>
);

export default GoodPostureNote;
