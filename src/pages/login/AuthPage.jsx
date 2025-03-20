import React, { useState } from 'react';
import { Card, Button } from 'antd';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const cardStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    marginTop: '100px',
  };

  return (
    <div>
      <Card title={isLogin ? "Login" : "Signup"} style={cardStyle}>
        {isLogin ? <LoginForm /> : <SignupForm />}
        <Button type="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
        </Button>
      </Card>
    </div>
  );
};

export default AuthPage;
