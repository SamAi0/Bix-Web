import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
    
    // Update cart count
    updateCartCount();
  }, []);

  useEffect(() => {
    // Listen for storage changes to update cart count across tabs
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateCartCount = () => {
    const cartData = JSON.parse(localStorage.getItem("cart") || "{}");
    const userCart = cartData[localStorage.getItem("username")] || [];
    const count = userCart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    setCartCount(0);
    navigate("/login");
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3" to="/">
            <i className="fas fa-leaf me-2"></i>Craft Culture
          </Link>
          <button
            className="navbar-toggler border-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon bg-light"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link text-light fw-medium" to="/">
                  <i className="fas fa-home me-1"></i>Home
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/products">
                      <i className="fas fa-box-open me-1"></i>Products
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/jobs">
                      <i className="fas fa-briefcase me-1"></i>Jobs
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/donate">
                      <i className="fas fa-hand-holding-heart me-1"></i>Donate
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/our-story">
                      <i className="fas fa-book me-1"></i>Our Story
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/feedback">
                      <i className="fas fa-comments me-1"></i>Feedback
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <ul className="navbar-nav">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/cart">
                      <i className="fas fa-shopping-cart me-1"></i>Cart {cartCount > 0 && (
                        <span className="badge bg-light text-dark rounded-pill ms-1">{cartCount}</span>
                      )}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/order">
                      <i className="fas fa-file-invoice me-1"></i>Orders
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/profile">
                      <i className="fas fa-user me-1"></i>Hi, {username}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button className="nav-link btn btn-outline-light btn-sm rounded-pill px-3" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-1"></i>Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-light fw-medium" to="/login">
                      <i className="fas fa-sign-in-alt me-1"></i>Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link btn btn-outline-light btn-sm rounded-pill px-3 ms-2" to="/register">
                      <i className="fas fa-user-plus me-1"></i>Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
