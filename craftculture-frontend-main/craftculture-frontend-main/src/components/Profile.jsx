import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Login.css"; // Using similar styling as login

const Profile = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    userRole: ""
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setEditData({
        username: response.data.username,
        email: response.data.email
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile information");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);
  
  const fetchOrderHistory = useCallback(async (username) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !username) {
        navigate("/login");
        return [];
      }
      
      const response = await axios.get(`${API_URL}/api/orders/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        navigate("/login");
      }
      return [];
    }
  }, [navigate]);

  const OrderHistoryList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
      const loadOrders = async () => {
        setLoading(true);
        try {
          const ordersData = await fetchOrderHistory(user.username);
          setOrders(ordersData);
        } catch (err) {
          setError("Failed to load order history");
        } finally {
          setLoading(false);
        }
      };
      
      if (user.username) {
        loadOrders();
      }
    }, [user.username]);

    if (loading) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 mb-0">Loading your order history...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="alert alert-danger">
          {error}
        </div>
      );
    }
    
    if (orders.length === 0) {
      return (
        <div className="text-center py-3">
          <p className="mb-0 text-muted">You haven't placed any orders yet.</p>
        </div>
      );
    }
    
    return (
      <div className="order-history-list">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-8)}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      order.status === "Delivered" ? "bg-success" :
                      order.status === "Cancelled" ? "bg-danger" :
                      order.status === "Processing" ? "bg-warning" :
                      order.status === "Shipped" ? "bg-info" :
                      "bg-secondary"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td>{order.items.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-3">
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate("/order")}
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (editData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!editData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(editData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Use the profile update endpoint instead of user ID endpoint
      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
      
      // Update localStorage
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("email", response.data.email);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordUpdating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.post(
        `${API_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  if (loading) {
    return (
      <div className="modern-login-page">
        <div className="animated-background">
          <div className="light-effect"></div>
        </div>
        <div className="login-container">
          <div className="login-card">
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-login-page">
      <div className="animated-background">
        <div className="light-effect"></div>
      </div>
      <div className="login-container">
        <div className="login-card profile-card">
          <div className="login-header text-center">
            <div className="logo-container">
              <div className="logo profile-logo">
                <i className="fas fa-user-circle"></i>
              </div>
            </div>
            <h2>My Profile</h2>
            <p>Manage your account information</p>
          </div>

          <div className="profile-content">
            {/* Profile Information Section */}
            <div className="profile-section">
              <h4 className="section-title">
                <i className="fas fa-user me-2"></i>Profile Information
              </h4>
              
              {editing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <div className="input-container">
                      <i className="fas fa-user input-icon"></i>
                      <input
                        type="text"
                        name="username"
                        value={editData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                        className={`modern-input ${errors.username ? 'is-invalid' : ''}`}
                        disabled={loading}
                      />
                      <div className="input-focus-effect"></div>
                    </div>
                    {errors.username && <div className="error-text">{errors.username}</div>}
                  </div>

                  <div className="form-group">
                    <div className="input-container">
                      <i className="fas fa-envelope input-icon"></i>
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        className={`modern-input ${errors.email ? 'is-invalid' : ''}`}
                        disabled={loading}
                      />
                      <div className="input-focus-effect"></div>
                    </div>
                    {errors.email && <div className="error-text">{errors.email}</div>}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        setEditData({
                          username: user.username,
                          email: user.email
                        });
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="profile-field">
                    <label>Username:</label>
                    <span>{user.username || 'N/A'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{user.email || 'N/A'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Role:</label>
                    <span className={`role-badge ${user.userRole ? user.userRole.toLowerCase() : 'normal'}`}>
                      {user.userRole || 'N/A'}
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary edit-profile-btn"
                    onClick={() => setEditing(true)}
                    disabled={loading}
                  >
                    <i className="fas fa-edit me-2"></i>Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Change Password Section */}
            <div className="profile-section">
              <h4 className="section-title">
                <i className="fas fa-key me-2"></i>Change Password
              </h4>
              
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <div className="input-container">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Current Password"
                      className={`modern-input ${errors.currentPassword ? 'is-invalid' : ''}`}
                      disabled={passwordUpdating}
                    />
                    <div className="input-focus-effect"></div>
                  </div>
                  {errors.currentPassword && <div className="error-text">{errors.currentPassword}</div>}
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New Password"
                      className={`modern-input ${errors.newPassword ? 'is-invalid' : ''}`}
                      disabled={passwordUpdating}
                    />
                    <div className="input-focus-effect"></div>
                  </div>
                  {errors.newPassword && <div className="error-text">{errors.newPassword}</div>}
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm New Password"
                      className={`modern-input ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
                      disabled={passwordUpdating}
                    />
                    <div className="input-focus-effect"></div>
                  </div>
                  {errors.confirmNewPassword && <div className="error-text">{errors.confirmNewPassword}</div>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={passwordUpdating}>
                  <i className="fas fa-key me-2"></i>{passwordUpdating ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
            
            {/* Order History Section */}
            <div className="profile-section">
              <h4 className="section-title">
                <i className="fas fa-shopping-cart me-2"></i>Order History
              </h4>
              
              <OrderHistoryList />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Profile;