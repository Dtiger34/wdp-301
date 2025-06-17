import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { checkUserAuth } from './utils/auth';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userData = checkUserAuth(token);
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/home" element={user ? <Home /> : <Navigate to="/login" />} /> */}
      {/* <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} /> */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;