import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddressBook = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
    isDefault: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddresses = JSON.parse(localStorage.getItem("addresses") || "[]");
    setAddresses(savedAddresses);
  }, []);

  const saveAddresses = (newAddresses) => {
    localStorage.setItem("addresses", JSON.stringify(newAddresses));
    setAddresses(newAddresses);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.postalCode) {
      alert("Please fill in all required fields");
      return;
    }

    const newAddress = {
      id: editingAddress ? editingAddress.id : Date.now(),
      ...formData,
      createdAt: editingAddress ? editingAddress.createdAt : new Date().toISOString()
    };

    let updatedAddresses;
    if (editingAddress) {
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id ? newAddress : addr
      );
    } else {
      updatedAddresses = [...addresses, newAddress];
    }

    // If this is marked as default, unset other defaults
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === newAddress.id
      }));
    }

    saveAddresses(updatedAddresses);
    
    // Reset form
    setFormData({
      name: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      isDefault: false
    });
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India",
      phone: address.phone || "",
      isDefault: address.isDefault || false
    });
    setShowForm(true);
  };

  const handleDelete = (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    saveAddresses(updatedAddresses);
  };

  const setDefaultAddress = (addressId) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    saveAddresses(updatedAddresses);
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-address-book me-2"></i>
          Address Book
        </h2>
        <div className="d-flex gap-2">
          {getDefaultAddress() && (
            <div className="badge bg-success">
              <i className="fas fa-check-circle me-1"></i>
              Default: {getDefaultAddress().name}
            </div>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingAddress(null);
              setFormData({
                name: "",
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: "India",
                phone: "",
                isDefault: false
              });
            }}
          >
            <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'} me-1`}></i>
            {showForm ? 'Cancel' : 'Add New Address'}
          </button>
        </div>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5>{editingAddress ? 'Edit Address' : 'Add New Address'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  required
                />
              </div>
              
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Postal Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Set as Default</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="isDefault">
                      Make this my default address
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Addresses List */}
      <h4 className="mb-3">Saved Addresses</h4>
      
      {addresses.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-map-marker-alt text-muted fa-3x mb-3"></i>
          <h4>No addresses saved</h4>
          <p className="text-muted">Add your shipping addresses for faster checkout!</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <i className="fas fa-plus me-1"></i>
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {addresses.map((address) => (
            <div key={address.id} className="col-md-6">
              <div className={`card h-100 ${address.isDefault ? 'border-primary border-2' : ''}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{address.name}</h5>
                      {address.isDefault && (
                        <span className="badge bg-primary">Default</span>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(address)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {!address.isDefault && (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => setDefaultAddress(address.id)}
                        >
                          <i className="fas fa-star"></i>
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(address.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                      {address.street}<br/>
                      {address.city}, {address.state} {address.postalCode}<br/>
                      {address.country}
                    </p>
                    {address.phone && (
                      <p className="mb-0">
                        <i className="fas fa-phone me-2 text-muted"></i>
                        {address.phone}
                      </p>
                    )}
                  </div>
                  
                  <small className="text-muted">
                    Added: {new Date(address.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;