import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SavedCarts = () => {
  const [savedCarts, setSavedCarts] = useState([]);
  const [cartName, setCartName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedCarts") || "[]");
    setSavedCarts(saved);
  }, []);

  const getCurrentCart = () => {
    const username = localStorage.getItem("username");
    if (!username) return [];
    
    const cartData = JSON.parse(localStorage.getItem("cart") || "{}");
    return cartData[username] || [];
  };

  const saveCurrentCart = () => {
    const currentCart = getCurrentCart();
    if (currentCart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (!cartName.trim()) {
      alert("Please enter a name for your saved cart");
      return;
    }

    const newSavedCart = {
      id: Date.now(),
      name: cartName,
      items: currentCart,
      createdAt: new Date().toISOString(),
      itemCount: currentCart.length,
      totalAmount: currentCart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    };

    const updatedSavedCarts = [...savedCarts, newSavedCart];
    localStorage.setItem("savedCarts", JSON.stringify(updatedSavedCarts));
    setSavedCarts(updatedSavedCarts);
    setCartName("");
    
    // Show success message
    const toast = document.createElement("div");
    toast.className = "toast show position-fixed top-0 end-0 m-3";
    toast.style.zIndex = "1000";
    toast.innerHTML = `
      <div class="toast-header bg-success text-white">
        <strong class="me-auto">Success</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        Cart saved successfully as "${cartName}"
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const loadSavedCart = (savedCart) => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/login");
      return;
    }

    let cartData = JSON.parse(localStorage.getItem("cart")) || {};
    cartData[username] = [...savedCart.items];
    localStorage.setItem("cart", JSON.stringify(cartData));
    
    // Show success message
    const toast = document.createElement("div");
    toast.className = "toast show position-fixed top-0 end-0 m-3";
    toast.style.zIndex = "1000";
    toast.innerHTML = `
      <div class="toast-header bg-success text-white">
        <strong class="me-auto">Success</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        "${savedCart.name}" loaded to your cart
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
    
    navigate("/cart");
  };

  const deleteSavedCart = (cartId) => {
    if (!window.confirm("Are you sure you want to delete this saved cart?")) return;
    
    const updatedSavedCarts = savedCarts.filter(cart => cart.id !== cartId);
    localStorage.setItem("savedCarts", JSON.stringify(updatedSavedCarts));
    setSavedCarts(updatedSavedCarts);
  };

  const getCurrentCartSummary = () => {
    const currentCart = getCurrentCart();
    if (currentCart.length === 0) return null;
    
    return {
      itemCount: currentCart.length,
      totalAmount: currentCart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    };
  };

  const currentCartSummary = getCurrentCartSummary();

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-save me-2"></i>
          Saved Carts
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate("/products")}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Continue Shopping
        </button>
      </div>

      {/* Save Current Cart Section */}
      {currentCartSummary && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>Save Your Current Cart</h5>
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Current Cart:</strong> {currentCartSummary.itemCount} items
                </p>
                <p className="mb-0">
                  <strong>Total:</strong> ₹{currentCartSummary.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name your saved cart..."
                    value={cartName}
                    onChange={(e) => setCartName(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={saveCurrentCart}
                  >
                    <i className="fas fa-save me-1"></i>Save Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Carts List */}
      <h4 className="mb-3">Your Saved Carts</h4>
      
      {savedCarts.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-cart text-muted fa-3x mb-3"></i>
          <h4>No saved carts yet</h4>
          <p className="text-muted">Save your shopping carts for later!</p>
          {currentCartSummary ? (
            <button 
              className="btn btn-primary"
              onClick={() => document.querySelector('input[placeholder="Name your saved cart..."]').focus()}
            >
              Save Your Current Cart
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Start Shopping
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {savedCarts.map((savedCart) => (
            <div key={savedCart.id} className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{savedCart.name}</h5>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteSavedCart(savedCart.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1">
                      <i className="fas fa-box me-2 text-muted"></i>
                      <strong>{savedCart.itemCount}</strong> items
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-rupee-sign me-2 text-muted"></i>
                      <strong>₹{savedCart.totalAmount.toFixed(2)}</strong>
                    </p>
                    <p className="mb-0 text-muted">
                      <i className="fas fa-calendar me-2"></i>
                      {new Date(savedCart.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button 
                    className="btn btn-primary w-100"
                    onClick={() => loadSavedCart(savedCart)}
                  >
                    <i className="fas fa-cart-arrow-down me-1"></i>
                    Load Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCarts;