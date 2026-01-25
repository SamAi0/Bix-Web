import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);
  }, []);

  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item._id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setWishlist(newWishlist);
    
    // Show toast notification
    const toast = document.createElement("div");
    toast.className = "toast show position-fixed top-0 end-0 m-3";
    toast.style.zIndex = "1000";
    toast.innerHTML = `
      <div class="toast-header bg-warning text-white">
        <strong class="me-auto">Removed</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        Item removed from wishlist
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const addToCart = (product) => {
    const username = localStorage.getItem("username");
    if (!username) {
      const confirmLogin = window.confirm(
        "Please log in to add products to your cart. Would you like to log in now?"
      );
      if (confirmLogin) {
        navigate("/login");
      }
      return;
    }

    let cartData = JSON.parse(localStorage.getItem("cart")) || {};
    if (!cartData[username]) {
      cartData[username] = [];
    }

    // Check if product is already in cart
    const existingProductIndex = cartData[username].findIndex(
      (item) => item._id === product._id
    );

    if (existingProductIndex !== -1) {
      // Product exists, increment quantity
      cartData[username][existingProductIndex].quantity =
        (cartData[username][existingProductIndex].quantity || 1) + 1;
    } else {
      // Add new product with quantity 1
      cartData[username].push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cartData));

    // Show toast notification
    const toast = document.createElement("div");
    toast.className = "toast show position-fixed top-0 end-0 m-3";
    toast.style.zIndex = "1000";
    toast.innerHTML = `
      <div class="toast-header bg-success text-white">
        <strong class="me-auto">Success</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${product.name} added to cart
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-heart text-danger me-2"></i>
          My Wishlist
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate("/products")}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Continue Shopping
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-heart text-muted fa-3x mb-3"></i>
          <h4>Your wishlist is empty</h4>
          <p className="text-muted">Start adding products you love!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((product) => (
            <div key={product._id} className="col-md-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <img
                  src={`${process.env.PUBLIC_URL}/images/products/${product.image}`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${process.env.PUBLIC_URL}/images/home.png`;
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">Price: ₹{product.price}</p>
                  {product.offer > 0 && (
                    <p className="card-text text-danger">
                      Offer: {product.offer}% off
                    </p>
                  )}
                  <p
                    className={`card-text ${
                      product.status === "Available"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {product.status}
                  </p>
                  
                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn btn-danger flex-fill"
                      onClick={() => removeFromWishlist(product._id)}
                    >
                      <i className="fas fa-trash me-1"></i>Remove
                    </button>
                    <button
                      className={`btn btn-primary flex-fill ${
                        product.status !== "Available" ? "disabled" : ""
                      }`}
                      onClick={() => addToCart(product)}
                      disabled={product.status !== "Available"}
                    >
                      {product.status === "Available"
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;