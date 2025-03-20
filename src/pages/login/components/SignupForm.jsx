// SignupForm.jsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../../firebase.jsx';
import { doc, setDoc } from "firebase/firestore";

const SignupForm = () => {
  const onFinish = async (values) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, values.email, values.password);
      // Create a user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: values.name,
        email: values.email,
        createdAt: new Date(),
      });
      message.success("Signup Successful");
    } catch (error) {
      message.error("Signup failed: " + error.message);
    }
  };

  return (
    <Form name="signup-form" onFinish={onFinish}>
      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Please enter your name!' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[{ required: true, message: 'Please enter your email!' }]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password!' }]}
      >
        <Input.Password placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Signup
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SignupForm;
