import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
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
                      />
                      <div className="input-focus-effect"></div>
                    </div>
                    {errors.email && <div className="error-text">{errors.email}</div>}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary me-2">
                      Save Changes
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
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="profile-field">
                    <label>Username:</label>
                    <span>{user.username}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-field">
                    <label>Role:</label>
                    <span className={`role-badge ${user.userRole.toLowerCase()}`}>
                      {user.userRole}
                    </span>
                  </div>
                  <button 
                    className="btn btn-primary edit-profile-btn"
                    onClick={() => setEditing(true)}
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
                    />
                    <div className="input-focus-effect"></div>
                  </div>
                  {errors.confirmNewPassword && <div className="error-text">{errors.confirmNewPassword}</div>}
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-key me-2"></i>Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Profile;