import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
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
    const username = localStorage.getItem("username");
    const userCart = cartData[username] || [];
    const count = userCart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
  };

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    navigate('/login');
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
              <li className="nav-item">
                <Link className="nav-link text-light fw-medium" to="/products">
                  <i className="fas fa-box-open me-1"></i>Products
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
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link text-light fw-medium" to="/cart">
                  <i className="fas fa-shopping-cart me-1"></i>Cart {cartCount > 0 && (
                    <span className="badge bg-light text-dark rounded-pill ms-1">{cartCount}</span>
                  )}
                </Link>
              </li>
              
              {token ? (
                <>
                  <li className="nav-item dropdown">
                    <button className="nav-link dropdown-toggle text-light fw-medium border-0 bg-transparent" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fas fa-user me-1"></i>{username}
                    </button>
                    <ul className="dropdown-menu">
                      <li><Link className="dropdown-item" to="/profile"><i className="fas fa-user-circle me-2"></i>Profile</Link></li>
                      <li><Link className="dropdown-item" to="/wishlist"><i className="fas fa-heart me-2"></i>Wishlist</Link></li>
                      <li><Link className="dropdown-item" to="/address-book"><i className="fas fa-address-book me-2"></i>Address Book</Link></li>
                      <li><Link className="dropdown-item" to="/saved-carts"><i className="fas fa-save me-2"></i>Saved Carts</Link></li>
                      <li><Link className="dropdown-item" to="/compare"><i className="fas fa-balance-scale me-2"></i>Compare Products</Link></li>
                      {userRole === 'ADMIN' && (
                        <>
                          <li><hr className="dropdown-divider" /></li>
                          <li><Link className="dropdown-item" to="/admin"><i className="fas fa-tachometer-alt me-2"></i>Admin Panel</Link></li>
                        </>
                      )}
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                    </ul>
                  </li>
                  {userRole === 'ADMIN' && (
                    <li className="nav-item ms-2">
                      <Link className="btn btn-light btn-sm rounded-pill px-3" to="/admin">
                        <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="nav-item ms-2">
                    <button 
                      className="btn btn-outline-light btn-sm rounded-pill px-3" 
                      onClick={handleLogout}
                    >
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
