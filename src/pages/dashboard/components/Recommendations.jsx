import React, { useState, useEffect } from 'react';
import { Card, Typography, Collapse, List, Tag, Button, Spin, message, Empty, Select } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { auth, db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const Recommendations = () => {
  const [ageGroup, setAgeGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // All possible age groups with exercises
  const allAgeGroups = [
    {
      id: "kids",
      title: "Kids (5-12 years old)",
      description: "These exercises focus on building awareness, posture habits, and a strong foundation.",
      exercises: [
        {
          name: "Superman Pose",
          description: "Lie on your stomach, extend arms and legs, and lift them off the ground. Hold for 5-10 seconds.",
          sets: "3 sets of 8 reps",
          difficulty: "Easy",
          videoId: "cc6UVRS7PW4"
        },
        {
          name: "Wall Angels",
          description: "Stand with back against wall, arms at 90 degrees. Slide arms up and down while maintaining contact with the wall.",
          sets: "2 sets of 10 reps",
          difficulty: "Easy",
          videoId: "M_ooIhKYs7c"
        },
        {
          name: "Cat-Cow Stretch",
          description: "On all fours, alternate between arching and rounding your back while breathing deeply.",
          sets: "2 sets of 8 reps each direction",
          difficulty: "Easy",
          videoId: "kqnua4rHVVA"
        }
      ]
    },
    {
      id: "teenagers",
      title: "Teenagers (13-19 years old)",
      description: "These exercises help counteract tech neck and slouching from school and device use.",
      exercises: [
        {
          name: "Doorway Chest Stretch",
          description: "Stand in a doorway with arms on door frame at 90 degrees, step forward to feel stretch in chest.",
          sets: "Hold for 30 seconds, 3 reps",
          difficulty: "Medium",
          videoId: "SV_gD0ijHWo"
        },
        {
          name: "Bird Dog",
          description: "From all fours, extend opposite arm and leg while maintaining a neutral spine.",
          sets: "3 sets of 10 reps each side",
          difficulty: "Medium",
          videoId: "wiFNA3sqjCA"
        },
        {
          name: "Scapular Retraction",
          description: "Sit or stand tall, pull shoulders back and down, hold for 5 seconds.",
          sets: "3 sets of 12 reps",
          difficulty: "Easy",
          videoId: "LT_dFRnmdGs"
        },
        {
          name: "Plank",
          description: "Hold a push-up position on forearms, maintaining a straight line from head to heels.",
          sets: "3 sets, hold for 20-30 seconds",
          difficulty: "Medium",
          videoId: "ASdvN_XEl_c"
        }
      ]
    },
    {
      id: "adults",
      title: "Adults (20-50 years old)",
      description: "These exercises target posture issues from desk work and daily stress patterns.",
      exercises: [
        {
          name: "Face Pulls",
          description: "Using resistance band at face level, pull toward face while externally rotating shoulders.",
          sets: "3 sets of 15 reps",
          difficulty: "Medium",
          videoId: "eIq5CB9JfKE"
        },
        {
          name: "Thoracic Extension",
          description: "Using a foam roller perpendicular to spine, extend back over roller at different segments.",
          sets: "Hold 30 seconds at each segment",
          difficulty: "Medium",
          videoId: "ZVdgb3HjU9A"
        },
        {
          name: "Dead Bug",
          description: "Lie on back with arms and legs up, lower opposite arm and leg while maintaining core engagement.",
          sets: "3 sets of 10 reps each side",
          difficulty: "Medium",
          videoId: "4XLEnwUb1JI"
        },
        {
          name: "Chin Tucks",
          description: "Draw chin back horizontally, creating a double chin sensation while maintaining level head.",
          sets: "3 sets of 15 reps",
          difficulty: "Easy",
          videoId: "wQylqJEBQcU"
        },
        {
          name: "Wall Slides",
          description: "Stand with back against wall, slide arms up and down while maintaining contact points.",
          sets: "3 sets of 12 reps",
          difficulty: "Medium",
          videoId: "JZj2tCFZzMw"
        }
      ]
    },
    {
      id: "seniors",
      title: "Seniors (50+ years old)",
      description: "These gentle exercises improve posture while respecting joint health and mobility.",
      exercises: [
        {
          name: "Seated Row with Band",
          description: "Sit tall, extend arms holding resistance band, pull elbows back while squeezing shoulder blades.",
          sets: "3 sets of 12 reps",
          difficulty: "Easy",
          videoId: "rT7DgCr-3pg"
        },
        {
          name: "Gentle Thoracic Rotation",
          description: "Seated or standing, rotate upper body while keeping hips facing forward.",
          sets: "2 sets of 10 reps each side",
          difficulty: "Easy",
          videoId: "Gwg9GIUzKXY"
        },
        {
          name: "Standing Shoulder Rolls",
          description: "Roll shoulders forward and backward in slow, controlled movements.",
          sets: "2 sets of 10 reps each direction",
          difficulty: "Very Easy",
          videoId: "JaCy-IgO9bY"
        },
        {
          name: "Seated Neck Stretch",
          description: "Gently tilt head to each side and hold, feeling stretch along side of neck.",
          sets: "Hold for 20 seconds each side",
          difficulty: "Very Easy",
          videoId: "CO3racIlTcg"
        }
      ]
    }
  ];

  // Map age to age group
  const determineAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum >= 5 && ageNum <= 12) return "kids";
    if (ageNum >= 13 && ageNum <= 19) return "teenagers";
    if (ageNum >= 20 && ageNum <= 50) return "adults";
    if (ageNum > 50) return "seniors";
    return null;
  };

  // Get age group object by ID
  const getAgeGroupById = (id) => {
    return allAgeGroups.find(group => group.id === id);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          // Get user document from Firestore
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            
            // Determine age group based on age in profile
            if (data.age) {
              const groupId = determineAgeGroup(data.age);
              setAgeGroup(groupId);
              setSelectedGroup(groupId);
            }
          } else {
            message.warning('No user profile found. Please select an age group manually.');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error('Failed to load user profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading your personalized recommendations..." />
      </div>
    );
  }

  // Get the current age group data
  const currentAgeGroup = selectedGroup ? getAgeGroupById(selectedGroup) : null;

  // Handle age group selection change
  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
        Posture Exercise Recommendations
      </Title>

      <Card style={{ marginBottom: '20px' }}>
        {userData?.age ? (
          <>
            <Text strong>Your age: </Text>
            <Text style={{ marginRight: '20px' }}>{userData.age} years old</Text>
            {ageGroup && (
              <Tag color="blue">
                {getAgeGroupById(ageGroup)?.title}
              </Tag>
            )}
          </>
        ) : (
          <Text>No age information found in your profile</Text>
        )}

        <div style={{ marginTop: '16px' }}>
          <Text strong>Select Exercise Group: </Text>
          <Select
            style={{ width: 250, marginLeft: '8px' }}
            value={selectedGroup}
            onChange={handleGroupChange}
            placeholder="Select an age group"
          >
            {allAgeGroups.map(group => (
              <Option key={group.id} value={group.id}>{group.title}</Option>
            ))}
          </Select>
          {ageGroup && selectedGroup !== ageGroup && (
            <Paragraph type="secondary" style={{ marginTop: '8px' }}>
              <InfoCircleOutlined /> You're viewing exercises outside your age group
            </Paragraph>
          )}
        </div>
      </Card>

      {currentAgeGroup ? (
        <div>
          <Card style={{ marginBottom: '20px' }}>
            <Title level={5}>{currentAgeGroup.title} Exercise Program</Title>
            <Paragraph>{currentAgeGroup.description}</Paragraph>
          </Card>

          <List
            itemLayout="vertical"
            dataSource={currentAgeGroup.exercises}
            renderItem={(exercise, index) => (
              <List.Item>
                <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{index + 1}. {exercise.name}</Text>
                      <Tag color={
                        exercise.difficulty === "Very Easy" ? "green" :
                        exercise.difficulty === "Easy" ? "lime" :
                        exercise.difficulty === "Medium" ? "blue" :
                        exercise.difficulty === "Hard" ? "orange" : "red"
                      }>
                        {exercise.difficulty}
                      </Tag>
                    </div>
                  }
                  style={{ width: '100%' }}
                >
                  <Paragraph>{exercise.description}</Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="purple">{exercise.sets}</Tag>
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />} 
                      href={`https://www.youtube.com/watch?v=${exercise.videoId}`}
                      target="_blank"
                    >
                      Watch Demo
                    </Button>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ) : (
        <Empty
          description="Please select an age group to view recommended exercises"
          style={{ marginTop: '40px' }}
        />
      )}

      <Card style={{ marginTop: '24px' }}>
        <Title level={5}>General Posture Tips</Title>
        <List
          dataSource={[
            'Maintain a neutral spine position throughout the day',
            'Take regular breaks from sitting (every 30 minutes)',
            'Adjust your workspace ergonomics (screen at eye level, elbows at 90°)',
            'Stay hydrated to maintain spinal disc health',
            'Strengthen core muscles to support your spine',
            'Be mindful of your posture during daily activities',
            'Use a supportive chair with proper lumbar support'
          ]}
          renderItem={item => <List.Item>{item}</List.Item>}
        />
      </Card>
    </div>
  );
};

export default Recommendations;