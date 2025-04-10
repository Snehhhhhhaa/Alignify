import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../../firebase';
import './LoginForm.css'; // Import CSS file

const PostureLoginForm = () => {
  const onFinish = async (values) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Login successful");
    } catch (error) {
      message.error("Login failed: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side - Image */}
        <div className="login-image">
          <div className="image-overlay" />
          <div className="image-text">
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <h2 className="form-title"> USER LOGIN</h2>
          
          <Form
            name="posture-login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Email" className="form-input" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password placeholder="Password" className="form-input" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className="login-button">
                LOGIN
              </Button>
            </Form.Item>
          </Form>

         
        </div>
      </div>
    </div>
  );
};

export default PostureLoginForm;