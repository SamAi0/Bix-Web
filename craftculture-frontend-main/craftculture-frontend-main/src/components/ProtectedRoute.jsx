import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Clear any potentially invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    // Redirect to login if no token exists
    return <Navigate to="/login" replace />;
  }
  
  // If token exists, render the children (protected component)
  return children;
};

export default ProtectedRoute;