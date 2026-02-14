import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../constant";
import { useNavigate, Link } from "react-router-dom";
import ProductReviews from "./ProductReviews";
import "../css/Product.css";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [recentlyPurchased, setRecentlyPurchased] = useState([]);
  const navigate = useNavigate();

  const categories = [
    { name: "All", color: "secondary" },
    { name: "Frames", color: "primary" },
    { name: "Wall Hanging", color: "success" },
    { name: "Bag", color: "danger" },
    { name: "Pen Stand", color: "warning" },
    { name: "Jewellery", color: "info" },
    { name: "Diyas", color: "dark" },
    { name: "Bottle Art", color: "light" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all products
        const productsResponse = await axios.get(`${API_URL}/api/products`);
        setProducts(productsResponse.data.products);
        setFilteredProducts(productsResponse.data.products);
        
        // Load wishlist from localStorage
        const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(savedWishlist);
        
        // Fetch recently purchased items
        try {
          const recentlyPurchasedResponse = await axios.get(`${API_URL}/api/products/recently-purchased`);
          setRecentlyPurchased(recentlyPurchasedResponse.data);
        } catch (recentError) {
          console.error("Error fetching recently purchased items:", recentError);
          // Silently fail if this endpoint is not available
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const username = localStorage.getItem("username");
    if (username) {
      const cartData = JSON.parse(localStorage.getItem("cart")) || {};
      const userCart = cartData[username] || [];
      setCartItemCount(userCart.length);
    }
  };

  const saveWishlist = (newWishlist) => {
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  const toggleWishlist = (product) => {
    const newWishlist = [...wishlist];
    const existingIndex = newWishlist.findIndex(item => item._id === product._id);
    
    if (existingIndex >= 0) {
      // Remove from wishlist
      newWishlist.splice(existingIndex, 1);
    } else {
      // Add to wishlist
      newWishlist.push(product);
    }
    
    saveWishlist(newWishlist);
    
    // Show toast notification
    const toast = document.createElement("div");
    toast.className = "toast show position-fixed top-0 end-0 m-3";
    toast.style.zIndex = "1000";
    toast.innerHTML = `
      <div class="toast-header bg-${existingIndex >= 0 ? 'warning' : 'success'} text-white">
        <strong class="me-auto">${existingIndex >= 0 ? 'Removed' : 'Added'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${product.name} ${existingIndex >= 0 ? 'removed from' : 'added to'} wishlist
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  const viewProductDetails = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...products];
    
    // Category filter
    if (activeCategory !== "All") {
      filtered = filtered.filter(product => product.category === activeCategory);
    }
    
    // Availability filter
    if (availabilityFilter === "available") {
      filtered = filtered.filter(product => product.status === "Available");
    } else if (availabilityFilter === "unavailable") {
      filtered = filtered.filter(product => product.status !== "Available");
    }
    
    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, activeCategory, sortBy, priceRange, availabilityFilter, searchQuery]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const filterProducts = (category) => {
    setActiveCategory(category);
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
    updateCartCount();

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
      {/* Recently Purchased Items Section */}
      {recentlyPurchased.length > 0 && (
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Recently Purchased Items</h3>
            <small className="text-muted">Items that other customers recently bought</small>
          </div>
          <div className="row g-3">
            {recentlyPurchased.slice(0, 6).map((product) => (
              <div key={`recent-${product._id}`} className="col-md-2 col-sm-4 col-6">
                <div className="card h-100 text-center shadow-sm">
                  <img
                    src={`${process.env.PUBLIC_URL}/images/products/${product.image}`}
                    className="card-img-top mx-auto"
                    alt={product.name}
                    style={{ height: "100px", width: "100px", objectFit: "cover" }}
                    onError={(e) => {
                      console.log(`Failed to load recent product image: ${product.image}`);
                      e.target.onerror = null;
                      const fallbackImages = [
                        `${process.env.PUBLIC_URL}/images/home.png`,
                        `${process.env.PUBLIC_URL}/images/parallex.png`
                      ];
                      let fallbackIndex = 0;
                      const tryNextFallback = () => {
                        if (fallbackIndex < fallbackImages.length) {
                          e.target.src = fallbackImages[fallbackIndex];
                          fallbackIndex++;
                        } else {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKAk0ltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }
                      };
                      tryNextFallback();
                    }}
                  />
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1" title={product.name}>
                      {product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name}
                    </h6>
                    <p className="card-text mb-1">₹{product.price}</p>
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => addToCart(product)}
                      disabled={product.status !== "Available"}
                    >
                      {product.status === "Available" ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Products</h2>
        <div className="d-flex gap-2">
          <Link to="/compare" className="btn btn-outline-info position-relative">
            <i className="fas fa-balance-scale me-1"></i>Compare
            {wishlist.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/wishlist" className="btn btn-outline-secondary position-relative">
            <i className="fas fa-heart me-1"></i>Wishlist
            {wishlist.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {wishlist.length}
              </span>
            )}
          </Link>
          <button className="btn btn-primary" onClick={() => navigate("/cart")}>
            Cart
            {cartItemCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort By */}
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="category">Category</option>
              </select>
            </div>
            
            {/* Availability Filter */}
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="all">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Out of Stock</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => setPriceRange([0, 1000])}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Price Range Display */}
          <div className="mt-3">
            <small className="text-muted">
              Showing products priced between ₹{priceRange[0]} - ₹{priceRange[1]}
            </small>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.name}
            className={`btn btn-${category.color} ${
              activeCategory === category.name ? "active" : ""
            }`}
            onClick={() => filterProducts(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="col-md-4">
            <div className="card h-100 shadow-sm hover-shadow">
              <div className="product-image-container">
                {product.offer > 0 && (
                  <span className="product-badge offer-badge">
                    {product.offer}% OFF
                  </span>
                )}
                {product.status === "Not Available" && (
                  <span className="product-badge out-of-stock-badge">
                    OUT OF STOCK
                  </span>
                )}
                <img
                  src={`${process.env.PUBLIC_URL}/images/products/${product.image}`}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => {
                    console.log(`Failed to load image: ${product.image}`);
                    e.target.onerror = null;
                    // Try alternative image paths
                    const fallbackImages = [
                      `${process.env.PUBLIC_URL}/images/home.png`,
                      `${process.env.PUBLIC_URL}/images/parallex.png`,
                      `${process.env.PUBLIC_URL}/images/donate.png`
                    ];
                    let fallbackIndex = 0;
                    const tryNextFallback = () => {
                      if (fallbackIndex < fallbackImages.length) {
                        e.target.src = fallbackImages[fallbackIndex];
                        fallbackIndex++;
                      } else {
                        // If all fallbacks fail, show a placeholder
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKAk0ltYWdlIE5vdCBGb3VuZOKApiA8L3RleHQ+PC9zdmc+';
                      }
                    };
                    tryNextFallback();
                  }}
                />
              </div>
              <div className="card-body d-flex flex-column product-info">
                <h5 className="card-title product-title">{product.name}</h5>
                <div className="product-price-section">
                  <p className="product-price">
                    ₹{product.price}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="original-price">₹{product.comparePrice}</span>
                    )}
                  </p>
                </div>
                {product.offer > 0 && (
                  <p className="card-text text-danger">
                    <i className="fas fa-tag me-1"></i>
                    Special Offer: {product.offer}% off
                  </p>
                )}
                <p
                  className={`card-text ${
                    product.status === "Available"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  <i className={`fas ${product.status === "Available" ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                  {product.status}
                </p>
                <div className="d-flex gap-2 mt-auto">
                  <button
                    className={`btn ${isInWishlist(product._id) ? 'btn-danger' : 'btn-outline-danger'} flex-fill`}
                    onClick={() => toggleWishlist(product)}
                  >
                    <i className={`fas ${isInWishlist(product._id) ? 'fa-heart' : 'fa-heart-o'}`}></i>
                  </button>
                  <button
                    className="btn btn-info flex-fill"
                    onClick={() => viewProductDetails(product)}
                  >
                    <i className="fas fa-eye me-1"></i>View
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

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.name}</h5>
                <button type="button" className="btn-close" onClick={closeProductModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/products/${selectedProduct.image}`}
                      className="img-fluid rounded"
                      alt={selectedProduct.name}
                      style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                      onError={(e) => {
                        console.log(`Failed to load modal product image: ${selectedProduct.image}`);
                        e.target.onerror = null;
                        const fallbackImages = [
                          `${process.env.PUBLIC_URL}/images/home.png`,
                          `${process.env.PUBLIC_URL}/images/parallex.png`,
                          `${process.env.PUBLIC_URL}/images/donate.png`
                        ];
                        let fallbackIndex = 0;
                        const tryNextFallback = () => {
                          if (fallbackIndex < fallbackImages.length) {
                            e.target.src = fallbackImages[fallbackIndex];
                            fallbackIndex++;
                          } else {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKAk0ltYWdlIE5vdCBGb3VuZOKApiA8L3RleHQ+PC9zdmc+';
                          }
                        };
                        tryNextFallback();
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <h4>₹{selectedProduct.price}</h4>
                    {selectedProduct.offer > 0 && (
                      <p className="text-danger">
                        <strong>Offer:</strong> {selectedProduct.offer}% off
                      </p>
                    )}
                    <p className={`fs-5 ${selectedProduct.status === "Available" ? "text-success" : "text-danger"}`}>
                      <strong>Status:</strong> {selectedProduct.status}
                    </p>
                    <p>
                      <strong>Category:</strong> {selectedProduct.category}
                    </p>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        className={`btn ${isInWishlist(selectedProduct._id) ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => toggleWishlist(selectedProduct)}
                      >
                        <i className={`fas ${isInWishlist(selectedProduct._id) ? 'fa-heart' : 'fa-heart-o'} me-1`}></i>
                        {isInWishlist(selectedProduct._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      </button>
                      <button
                        className={`btn btn-primary ${selectedProduct.status !== "Available" ? "disabled" : ""}`}
                        onClick={() => {
                          addToCart(selectedProduct);
                          closeProductModal();
                        }}
                        disabled={selectedProduct.status !== "Available"}
                      >
                        <i className="fas fa-shopping-cart me-1"></i>
                        {selectedProduct.status === "Available" ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Product Reviews */}
                <ProductReviews productId={selectedProduct._id} productName={selectedProduct.name} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeProductModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
