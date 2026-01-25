import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import { toast } from "react-toastify";

const BulkProductUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvContent) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    
    const requiredHeaders = ['name', 'price', 'quantity', 'category'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Convert numeric fields
      if (row.price) row.price = parseFloat(row.price);
      if (row.quantity) row.quantity = parseInt(row.quantity);
      if (row.offer) row.offer = parseInt(row.offer);
      
      data.push(row);
    }

    setPreviewData(data.slice(0, 10)); // Show first 10 rows as preview
    toast.success(`Parsed ${data.length} products from CSV`);
  };

  const handleBulkUpload = async () => {
    if (previewData.length === 0) {
      toast.error('Please upload a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/products/bulk-upload`,
        { products: previewData },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setUploadResults(response.data);
      toast.success(`Successfully uploaded ${response.data.successCount} products`);
      
      // Clear preview after successful upload
      setPreviewData([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,price,quantity,category,subcategory,description,status,offer,image,tags
Wooden Frame,120.00,15,Frames,Decorative,A beautiful wooden frame,Available,10,frames/frame1.jpg,"wood,decorative"
Wall Hanging,80.00,20,Wall Hanging,Bedroom Decor,Handcrafted wall hanging,Available,15,wallhangings/wh1.jpg,"handmade,decorative"
Cotton Bag,50.00,30,Bag,Shopping Bag,Eco-friendly cotton bag,Available,5,bags/bag1.jpg,"eco,cotton,shopping"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bulk Product Upload</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={downloadTemplate}
        >
          <i className="fas fa-download me-2"></i>
          Download Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Upload CSV File</h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Select CSV File</label>
            <input
              type="file"
              className="form-control"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <div className="form-text">
              Upload a CSV file with product information. Download the template for required format.
            </div>
          </div>
          
          {previewData.length > 0 && (
            <div className="mt-3">
              <h6>Preview ({previewData.length} products)</h6>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((product, index) => (
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>₹{product.price}</td>
                        <td>{product.quantity}</td>
                        <td>{product.category}</td>
                        <td>{product.status || 'Available'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleBulkUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Upload {previewData.length} Products
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setPreviewData([])}
                >
                  Clear Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {uploadResults && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Upload Results</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="border rounded p-3 text-center bg-success text-white">
                  <h3>{uploadResults.successCount}</h3>
                  <p className="mb-0">Successful</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3 text-center bg-warning text-dark">
                  <h3>{uploadResults.updatedCount || 0}</h3>
                  <p className="mb-0">Updated</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3 text-center bg-danger text-white">
                  <h3>{uploadResults.errorCount || 0}</h3>
                  <p className="mb-0">Errors</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="border rounded p-3 text-center bg-info text-white">
                  <h3>{uploadResults.totalCount}</h3>
                  <p className="mb-0">Total Processed</p>
                </div>
              </div>
            </div>
            
            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <div className="mt-4">
                <h6>Errors:</h6>
                <div className="alert alert-danger">
                  <ul className="mb-0">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Instructions</h5>
        </div>
        <div className="card-body">
          <h6>Required Columns:</h6>
          <ul>
            <li><strong>name</strong> - Product name (required)</li>
            <li><strong>price</strong> - Product price (required)</li>
            <li><strong>quantity</strong> - Available quantity (required)</li>
            <li><strong>category</strong> - Product category (required)</li>
          </ul>
          
          <h6>Optional Columns:</h6>
          <ul>
            <li><strong>sku</strong> - Stock keeping unit</li>
            <li><strong>subcategory</strong> - Product subcategory</li>
            <li><strong>description</strong> - Product description</li>
            <li><strong>status</strong> - Available/Not Available/Discontinued</li>
            <li><strong>offer</strong> - Discount percentage</li>
            <li><strong>image</strong> - Image path</li>
            <li><strong>tags</strong> - Comma-separated tags</li>
          </ul>
          
          <div className="alert alert-info mt-3">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Tip:</strong> Download the template to see the exact format required. 
            Make sure to save your CSV file with UTF-8 encoding.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;