// LoginForm.jsx
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../firebase.jsx';  // Adjust path as needed

const LoginForm = () => {
  const onFinish = async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Login Successful");
    } catch (error) {
      message.error("Login failed: " + error.message);
    }
  };

  return (
    <Form name="login-form" onFinish={onFinish}>
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
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
