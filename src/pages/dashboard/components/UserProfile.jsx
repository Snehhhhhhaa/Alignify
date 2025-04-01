import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import './UserProfile.css';

const { Option } = Select;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const profileData = {
        uid: auth.currentUser.uid,
        name: values.name,
        weight: values.weight,
        age: values.age,
        gender: values.gender,
        healthIssues: values.healthIssues,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "userProfiles"), profileData);
      message.success("Profile saved successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("Error saving profile. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="user-profile-container">
      <h2 className="user-profile-header">User Profile</h2>
      <Form
        form={form}
        layout="vertical"
        className="user-profile-form"
        onFinish={onFinish}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>

        <Form.Item
          label="Weight (kg)"
          name="weight"
          rules={[{ required: true, message: 'Please input your weight!' }]}
        >
          <Input placeholder="Enter your weight" type="number" />
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, message: 'Please input your age!' }]}
        >
          <Input placeholder="Enter your age" type="number" />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: 'Please select your gender!' }]}
        >
          <Select placeholder="Select gender">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Health Issues" name="healthIssues">
          <Input.TextArea
            placeholder="Enter any health issues (optional)"
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
            Save Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile;
