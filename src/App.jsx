import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import AuthPage from './pages/login/AuthPage';
import Dashboard from './pages/dashboard/Dashboard';
import { auth } from './firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Current user:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a spinner or loader component.
  }

  return (
    <Router>
      <Routes>
        {/* If the user is not logged in, show AuthPage. If they are, redirect them to the Dashboard */}
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
        {/* Protected route: if not logged in, redirect to /auth */}
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
