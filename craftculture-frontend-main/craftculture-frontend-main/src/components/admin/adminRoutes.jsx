import React from "react";
import { Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";
import AdminJobs from "./AdminJobs";
import AdminCompanies from "./AdminCompanies";
import AdminApplicants from "./AdminApplicants";
import AdminDonations from "./AdminDonations";

// Admin Route Guard Component
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
  return <AdminLayout>{children}</AdminLayout>;
};

// Admin Routes Configuration
export const adminRoutes = [
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminRoute>
        <AdminUsers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <AdminRoute>
        <AdminProducts />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <AdminRoute>
        <AdminOrders />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <AdminRoute>
        <AdminJobs />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/companies",
    element: (
      <AdminRoute>
        <AdminCompanies />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/applicants",
    element: (
      <AdminRoute>
        <AdminApplicants />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/donate-money",
    element: (
      <AdminRoute>
        <AdminDonations type="money" />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/donate-products",
    element: (
      <AdminRoute>
        <AdminDonations type="product" />
      </AdminRoute>
    ),
  },
];

export default adminRoutes;
