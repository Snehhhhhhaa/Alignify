import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Upload, Avatar, Spin, Divider } from 'antd';
import { UserOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, storage } from '../../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './UserProfile.css';

const { Option } = Select;
const { TextArea } = Input;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch existing user profile on load
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (auth.currentUser) {
          // Check in the 'users' collection for the user's profile
          const userProfileRef = doc(db, "users", auth.currentUser.uid);
          const userProfileSnapshot = await getDoc(userProfileRef);

          if (userProfileSnapshot.exists()) {
            const profileData = userProfileSnapshot.data();
            setUserProfile(profileData);
            setImageUrl(profileData.photoURL);

            // Populate form with existing data
            form.setFieldsValue({
              name: profileData.name,
              weight: profileData.weight,
              age: profileData.age,
              gender: profileData.gender,
              healthIssues: profileData.healthIssues,
              occupation: profileData.occupation,
              height: profileData.height,
              fitnessGoal: profileData.fitnessGoal,
              activityLevel: profileData.activityLevel
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        message.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  const handleImageUpload = async (file) => {
    setUploadLoading(true);
    try {
      // Create a storage reference
      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      setImageUrl(downloadURL);
      message.success("Image uploaded successfully");
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Failed to upload image");
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const customUploadRequest = async ({ file, onSuccess, onError }) => {
    try {
      await handleImageUpload(file);
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    
    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error('Image must be smaller than 2MB!');
    }
    
    return isImage && isLessThan2MB;
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const profileData = {
        uid: auth.currentUser.uid,
        name: values.name,
        weight: values.weight,
        age: values.age,
        gender: values.gender,
        healthIssues: values.healthIssues || "",
        occupation: values.occupation || "",
        height: values.height || "",
        fitnessGoal: values.fitnessGoal || "",
        activityLevel: values.activityLevel || "",
        photoURL: imageUrl,
        updatedAt: serverTimestamp(),
      };

      // If we're updating an existing profile
      if (userProfile) {
        await setDoc(doc(db, "users", auth.currentUser.uid), 
          { ...profileData, createdAt: userProfile.createdAt }, 
          { merge: true }
        );
        message.success("Profile updated successfully!");
      } else {
        // Creating a new profile
        profileData.createdAt = serverTimestamp();
        await setDoc(doc(db, "users", auth.currentUser.uid), profileData);
        message.success("Profile created successfully!");
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Error saving profile. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <Spin size="large" tip="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <h2 className="user-profile-header">User Profile</h2>
      
      <div className="profile-image-section">
        <Avatar 
          size={100} 
          icon={<UserOutlined />} 
          src={imageUrl}
          className="profile-avatar"
        />
        <Upload
          name="profileImage"
          listType="picture"
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customUploadRequest}
        >
          <Button 
            icon={uploadLoading ? <LoadingOutlined /> : <UploadOutlined />} 
            loading={uploadLoading}
          >
            {imageUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </Upload>
      </div>

      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        className="user-profile-form"
        onFinish={onFinish}
      >
        <div className="form-row">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
            className="form-col"
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            label="Age"
            name="age"
            rules={[{ required: true, message: 'Please input your age!' }]}
            className="form-col"
          >
            <Input placeholder="Enter your age" type="number" />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            label="Weight (kg)"
            name="weight"
            rules={[{ required: true, message: 'Please input your weight!' }]}
            className="form-col"
          >
            <Input placeholder="Enter your weight" type="number" />
          </Form.Item>

          <Form.Item
            label="Height (cm)"
            name="height"
            className="form-col"
          >
            <Input placeholder="Enter your height" type="number" />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: 'Please select your gender!' }]}
            className="form-col"
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Occupation"
            name="occupation"
            className="form-col"
          >
            <Input placeholder="Enter your occupation" />
          </Form.Item>
        </div>

        <div className="form-row">
          <Form.Item
            label="Activity Level"
            name="activityLevel"
            className="form-col"
          >
            <Select placeholder="Select activity level">
              <Option value="sedentary">Sedentary (little or no exercise)</Option>
              <Option value="light">Lightly active (light exercise 1-3 days/week)</Option>
              <Option value="moderate">Moderately active (moderate exercise 3-5 days/week)</Option>
              <Option value="active">Very active (hard exercise 6-7 days a week)</Option>
              <Option value="extreme">Extremely active (very hard exercise & physical job)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Fitness Goal"
            name="fitnessGoal"
            className="form-col"
          >
            <Select placeholder="Select your fitness goal">
              <Option value="posture">Improve Posture</Option>
              <Option value="strength">Build Strength</Option>
              <Option value="flexibility">Increase Flexibility</Option>
              <Option value="rehab">Rehabilitation</Option>
              <Option value="prevention">Injury Prevention</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="Health Issues" name="healthIssues">
          <TextArea
            placeholder="Enter any health issues, injuries, or conditions (optional)"
            rows={3}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="submit-button"
          >
            {userProfile ? 'Update Profile' : 'Save Profile'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile;
