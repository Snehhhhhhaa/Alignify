import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../../firebase.jsx';
import { doc, setDoc } from "firebase/firestore";
import './LoginForm.css'; // Reuse the same CSS file

const SignupForm = () => {
  const onFinish = async (values) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, values.email, values.password);
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
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side - Image (same as login) */}
        <div className="login-image">
          <div className="image-overlay" />
          
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <h2 className="form-title">CREATE ACCOUNT</h2>
          
          <Form
            name="signup-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please enter your name!' }]}
            >
              <Input placeholder="Name" className="form-input" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }]}
            >
              <Input placeholder="Email" className="form-input" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password placeholder="Password" className="form-input" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                className="login-button"
              >
                SIGN UP
              </Button>
            </Form.Item>
          </Form>

          
        </div>
      </div>
    </div>
  );
};

export default SignupForm;