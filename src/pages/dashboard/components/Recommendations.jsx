import React from 'react';
import { Card, Typography, List } from 'antd';

const { Title } = Typography;

const Recommendations = () => {
  const tips = [
    'Maintain a neutral spine position.',
    'Take regular breaks from sitting.',
    'Perform stretching exercises.',
    'Adjust your workspace ergonomics.'
  ];

  return (
    <Card title="Recommendations" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Title level={4}>Posture Improvement Tips</Title>
      <List
        dataSource={tips}
        renderItem={item => <List.Item>{item}</List.Item>}
      />
    </Card>
  );
};

export default Recommendations;
