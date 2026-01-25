import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constant";
import { useNavigate } from "react-router-dom";

const ProductComparison = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.some(p => p._id === product._id);
    
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p._id !== product._id));
    } else {
      if (selectedProducts.length < 4) {
        setSelectedProducts([...selectedProducts, product]);
      }
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
  };

  const isInSelection = (productId) => {
    return selectedProducts.some(p => p._id === productId);
  };

  const getComparisonData = () => {
    if (selectedProducts.length < 2) return null;

    const data = {
      categories: [...new Set(selectedProducts.map(p => p.category))],
      priceRange: {
        min: Math.min(...selectedProducts.map(p => p.price)),
        max: Math.max(...selectedProducts.map(p => p.price))
      },
      avgRating: selectedProducts.reduce((sum, p) => sum + p.rating, 0) / selectedProducts.length,
      totalItems: selectedProducts.length
    };

    return data;
  };

  const comparisonData = getComparisonData();

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-balance-scale me-2"></i>
          Product Comparison
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate("/products")}
        >
          <i className="fas fa-arrow-left me-1"></i>
          Back to Products
        </button>
      </div>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Comparing {selectedProducts.length} Products
                {selectedProducts.length < 2 && (
                  <span className="text-warning ms-2">(Select at least 2 products)</span>
                )}
              </h5>
              <div>
                {comparisonData && (
                  <div className="d-flex gap-3">
                    <span className="badge bg-info">
                      Price Range: ₹{comparisonData.priceRange.min} - ₹{comparisonData.priceRange.max}
                    </span>
                    <span className="badge bg-success">
                      Avg Rating: {comparisonData.avgRating.toFixed(1)}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-flex flex-wrap gap-3 mt-3">
              {selectedProducts.map(product => (
                <div key={product._id} className="border rounded p-3 bg-light position-relative" style={{width: '200px'}}>
                  <button 
                    className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                    onClick={() => removeProduct(product._id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <div className="text-center">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/products/${product.image}`}
                      alt={product.name}
                      className="rounded mb-2"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${process.env.PUBLIC_URL}/images/home.png`;
                      }}
                    />
                    <h6 className="mb-1">{product.name}</h6>
                    <p className="mb-0 text-primary">₹{product.price}</p>
                    <small className="text-muted">{product.category}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="row g-4">
        {products.map(product => (
          <div key={product._id} className="col-md-3">
            <div className={`card h-100 shadow-sm hover-shadow ${isInSelection(product._id) ? 'border-primary border-2' : ''}`}>
              <div className="position-relative">
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
                {isInSelection(product._id) && (
                  <div className="position-absolute top-0 start-0 bg-primary text-white p-2 rounded-end">
                    <i className="fas fa-check"></i>
                  </div>
                )}
                {product.offer > 0 && (
                  <div className="position-absolute top-0 end-0 bg-danger text-white p-2 rounded-start">
                    {product.offer}% OFF
                  </div>
                )}
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">
                  <strong>Price:</strong> ₹{product.price}
                </p>
                <p className="card-text">
                  <strong>Category:</strong> {product.category}
                </p>
                {product.rating > 0 && (
                  <p className="card-text">
                    <strong>Rating:</strong> {product.rating.toFixed(1)}/5
                  </p>
                )}
                <p className={`card-text ${product.status === "Available" ? "text-success" : "text-danger"}`}>
                  <strong>Status:</strong> {product.status}
                </p>
                
                <div className="mt-auto">
                  <button
                    className={`btn w-100 ${
                      isInSelection(product._id) 
                        ? 'btn-danger' 
                        : selectedProducts.length >= 4 
                          ? 'btn-secondary disabled' 
                          : 'btn-outline-primary'
                    }`}
                    onClick={() => toggleProductSelection(product)}
                    disabled={!isInSelection(product._id) && selectedProducts.length >= 4}
                  >
                    {isInSelection(product._id) 
                      ? 'Remove from Comparison' 
                      : selectedProducts.length >= 4 
                        ? 'Max 4 Products' 
                        : 'Add to Compare'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {selectedProducts.length >= 2 && (
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Detailed Comparison</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Feature</th>
                    {selectedProducts.map(product => (
                      <th key={product._id} className="text-center">
                        <div>
                          <img
                            src={`${process.env.PUBLIC_URL}/images/products/${product.image}`}
                            alt={product.name}
                            className="rounded mb-2"
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          />
                          <div>{product.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Price</strong></td>
                    {selectedProducts.map(product => (
                      <td key={product._id} className="text-center">
                        <span className="fw-bold">₹{product.price}</span>
                        {product.offer > 0 && (
                          <div className="text-success">
                            <small>{product.offer}% off</small>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Category</strong></td>
                    {selectedProducts.map(product => (
                      <td key={product._id} className="text-center">
                        {product.category}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    {selectedProducts.map(product => (
                      <td key={product._id} className="text-center">
                        <span className={product.status === "Available" ? "text-success" : "text-danger"}>
                          {product.status}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Rating</strong></td>
                    {selectedProducts.map(product => (
                      <td key={product._id} className="text-center">
                        {product.rating > 0 ? (
                          <div>
                            <div className="text-warning">
                              {'★'.repeat(Math.floor(product.rating))}
                              {'☆'.repeat(5 - Math.floor(product.rating))}
                            </div>
                            <small>({product.rating.toFixed(1)}/5)</small>
                          </div>
                        ) : (
                          <small className="text-muted">No ratings</small>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Best Value</strong></td>
                    {selectedProducts.map(product => {
                      const valueScore = product.rating * 10 - (product.price / 100);
                      return (
                        <td key={product._id} className="text-center">
                          <div className="progress" style={{height: '20px'}}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{width: `${Math.max(0, Math.min(100, valueScore + 50))}%`}}
                            >
                              {valueScore.toFixed(1)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-balance-scale text-muted fa-3x mb-3"></i>
          <h4>Select products to compare</h4>
          <p className="text-muted">Choose up to 4 products to see detailed comparison</p>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;