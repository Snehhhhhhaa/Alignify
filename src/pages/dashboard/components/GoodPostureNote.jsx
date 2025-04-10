import React from 'react';
import { Card, Typography, List } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './GoodPostureNote.css';

const { Title, Paragraph, Text } = Typography;

const GoodPostureNote = () => {
  // Benefits of good posture
  const benefits = [
    "Reduces stress on muscles, ligaments, and joints",
    "Prevents muscle fatigue and strain",
    "Decreases wear and tear on joint surfaces",
    "Allows for efficient muscle use and energy conservation",
    "Helps maintain balance and stability",
    "Contributes to an appealing appearance and confidence",
    "Allows organs to function optimally",
    "Improves breathing efficiency and oxygen intake"
  ];

  // Common signs of poor posture
  const poorPostureSigns = [
    "Rounded shoulders and forward head positioning",
    "Low back pain or discomfort",
    "Muscle fatigue and tension, especially in the neck, shoulders, and back",
    "Headaches and jaw pain",
    "Limited range of motion and stiffness",
    "Breathing difficulties or shallow breathing",
    "Poor balance and increased risk of falling",
    "Digestive issues due to compressed organs"
  ];

  return (
    <div className="good-posture-container">
      <div className="posture-header">
        <Title level={1}>The Importance of Good Posture</Title>
        <Paragraph className="posture-subtitle">
          Maintaining proper body alignment is essential for both short-term comfort and long-term health
        </Paragraph>
      </div>

      <div className="posture-content">
        <Card className="posture-card introduction-card">
          <Title level={3}>What is Good Posture?</Title>
          <Paragraph>
            Good posture refers to the proper alignment of body segments in positions that place the least strain on supporting muscles and ligaments during movement and weight-bearing activities. It involves training your body to stand, walk, sit, and lie in positions where the least strain is placed on supporting muscles and ligaments.
          </Paragraph>
          <Paragraph>
            Proper posture keeps bones and joints in correct alignment, decreases abnormal wear on joint surfaces, and minimizes the likelihood of strain and overuse. It also contributes to an appealing appearance that projects confidence and poise.
          </Paragraph>
        </Card>

        <div className="posture-two-column">
          <Card className="posture-card benefits-card">
            <Title level={3} className="card-title">
              <CheckCircleOutlined className="title-icon benefit-icon" /> Benefits of Good Posture
            </Title>
            <List
              dataSource={benefits}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Card className="posture-card warning-card">
            <Title level={3} className="card-title">
              <ExclamationCircleOutlined className="title-icon warning-icon" /> Signs of Poor Posture
            </Title>
            <List
              dataSource={poorPostureSigns}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <Card className="posture-card conclusion-card">
          <Title level={3}>Taking Action</Title>
          <Paragraph>
            Improving your posture is a gradual process that requires consistent awareness and practice. Start by becoming aware of your posture during daily activities, then work on strengthening core muscles that support good alignment.
          </Paragraph>
          <Paragraph>
            Remember that good posture is not about rigidly holding yourself in one position, but about maintaining balanced alignment that can adapt to different activities while minimizing strain.
          </Paragraph>
          {/* The action-buttons div and the buttons have been removed */}
        </Card>
      </div>
    </div>
  );
};

export default GoodPostureNote;