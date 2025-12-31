import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is logged in and has admin role
  if (!token || userRole !== 'ADMIN') {
    // Clear any potentially invalid tokens
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      localStorage.removeItem('email');
    }
    // Redirect to login if not authenticated or not an admin
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated and is an admin, render the children (protected component)
  return children;
};

export default AdminRoute;