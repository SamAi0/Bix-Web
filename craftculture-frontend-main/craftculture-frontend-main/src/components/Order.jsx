import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../constant";
import { useNavigate } from "react-router-dom";
import OrderBill from "./OrderBill";
import "../css/Order.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${username}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);



  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-badge status-pending";
      case "processing":
        return "status-badge status-processing";
      case "shipped":
        return "status-badge status-shipped";
      case "out for delivery":
        return "status-badge status-delivery";
      case "delivered":
        return "status-badge status-delivered";
      case "cancelled":
        return "status-badge status-cancelled";
      case "returned":
        return "status-badge status-returned";
      default:
        return "status-badge";
    }
  };

  const getOrderTimeline = (order) => {
    // Map order status names to timeline display names
    const statusDisplayMap = {
      "Pending": "Order Placed",
      "Processing": "Processing",
      "Shipped": "Shipped",
      "Out for Delivery": "Out for Delivery",
      "Delivered": "Delivered",
      "Cancelled": "Cancelled",
    };
    
    // Define the complete timeline sequence
    const fullTimeline = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
    
    // Create timeline based on status history if available
    if (order.statusHistory && order.statusHistory.length > 0) {
      // Create a map of status to its timestamp and notes
      const statusMap = {};
      order.statusHistory.forEach(historyItem => {
        const displayName = statusDisplayMap[historyItem.status] || historyItem.status;
        statusMap[displayName] = {
          timestamp: historyItem.timestamp,
          notes: historyItem.notes,
        };
      });
      
      // Build timeline based on the full sequence, marking completed statuses
      return fullTimeline.map(status => {
        const statusInfo = statusMap[status];
        return {
          status: status,
          completed: !!statusInfo, // Mark as completed if it has a timestamp
          date: statusInfo ? new Date(statusInfo.timestamp).toLocaleDateString() : "--",
          notes: statusInfo ? statusInfo.notes : "",
        };
      });
    }
    
    // Fallback to original timeline if no history exists
    const timeline = [
      { status: "Order Placed", completed: true, date: new Date(order.orderDate).toLocaleDateString() },
      { status: "Processing", completed: order.status !== "Pending", date: "--" },
      { status: "Shipped", completed: ["Shipped", "Out for Delivery", "Delivered"].includes(order.status), date: "--" },
      { status: "Out for Delivery", completed: ["Out for Delivery", "Delivered"].includes(order.status), date: "--" },
      { status: "Delivered", completed: order.status === "Delivered", date: "--" }
    ];
    return timeline;
  };

  const getTrackingInfo = (order) => {
    const tracking = {
      carrier: "FastExpress",
      trackingNumber: `FX${order._id.slice(-8).toUpperCase()}`,
      estimatedDelivery: "2-3 business days",
      currentLocation: "In Transit - Delhi Hub"
    };
    return tracking;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="container">
        <h2 className="mb-4">Your Orders</h2>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <h3>No Orders Yet</h3>
            <p>
              You haven't placed any orders yet. Start shopping to see your
              orders here.
            </p>
            <button className="btn-shop" onClick={() => navigate("/")}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="row">
            {orders.map((order) => (
              <div key={order._id} className="col-12">
                <div className="order-card">
                  <div className="order-header">
                    <div className="row align-items-center">
                      <div className="col">
                        <strong className="order-id">
                          Order #{order._id.slice(-8)}
                        </strong>
                      </div>
                      <div className="col text-end">
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="order-body">
                    <div className="row">
                      <div className="col-md-8">
                        <h6 className="mb-3">Items</h6>
                        <div className="order-items">
                          {order.items.map((item, index) => (
                            <div key={index} className="item-row">
                              <div>
                                <div className="item-name">{item.name}</div>
                                <div className="item-details">
                                  Quantity: {item.quantity || 1}
                                </div>
                              </div>
                              <div className="item-price">
                                ₹
                                {(
                                  item.price *
                                  (item.quantity || 1) *
                                  (1 - (item.offer || 0) / 100)
                                ).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="order-summary">
                          <h6 className="mb-3">Order Details</h6>
                          <div className="summary-row">
                            <span className="summary-label">Order Date:</span>
                            <span className="summary-value">
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="summary-row">
                            <span className="summary-label">Total Amount:</span>
                            <span className="summary-value">
                              ₹{order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="summary-row">
                            <span className="summary-label">
                              Payment Method:
                            </span>
                            <span className="summary-value">
                              {order.paymentMethod}
                            </span>
                          </div>
                                                  
                          {/* Order Timeline */}
                          <div className="mt-3">
                            <h6 className="mb-2">Order Progress</h6>
                            <div className="timeline">
                              {getOrderTimeline(order).map((step, index) => (
                                <div key={index} className={`timeline-item ${step.completed ? 'completed' : ''}`}>
                                  <div className="timeline-dot"></div>
                                  <div className="timeline-content">
                                    <div className="timeline-status">{step.status}</div>
                                    {step.date && step.date !== '--' && (
                                      <div className="timeline-date">{step.date}</div>
                                    )}
                                    {step.notes && step.notes !== '' && (
                                      <div className="timeline-notes small text-muted">{step.notes}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Show Detailed Status History if available */}
                            {order.statusHistory && order.statusHistory.length > 0 && (
                              <div className="mt-3">
                                <h6 className="mb-2">Status History</h6>
                                <div className="status-history-list">
                                  {[...order.statusHistory]
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map((history, index) => (
                                      <div key={index} className="status-history-item p-2 border-bottom">
                                        <div className="d-flex justify-content-between">
                                          <span className="fw-medium">{history.status}</span>
                                          <small className="text-muted">
                                            {new Date(history.timestamp).toLocaleString()}
                                          </small>
                                        </div>
                                        {history.notes && history.notes !== '' && (
                                          <div className="small text-muted mt-1">
                                            <i className="fas fa-sticky-note me-1"></i>
                                            {history.notes}
                                          </div>
                                        )}
                                        {history.updatedBy && (
                                          <div className="small text-muted">
                                            <i className="fas fa-user me-1"></i>
                                            Updated by: {history.updatedBy}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                                                  
                          {/* Tracking Info */}
                          {order.status === "Shipped" || order.status === "Out for Delivery" || order.status === "Delivered" ? (
                            <div className="mt-3 p-3 bg-light rounded">
                              <h6 className="mb-2">📦 Tracking Information</h6>
                              <div className="small">
                                <div><strong>Carrier:</strong> {getTrackingInfo(order).carrier}</div>
                                <div><strong>Tracking #:</strong> {getTrackingInfo(order).trackingNumber}</div>
                                <div><strong>Estimated Delivery:</strong> {getTrackingInfo(order).estimatedDelivery}</div>
                                <div><strong>Current Location:</strong> {getTrackingInfo(order).currentLocation}</div>
                              </div>
                              <button className="btn btn-sm btn-outline-primary mt-2">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                Track Package
                              </button>
                            </div>
                          ) : null}
                                                  
                          <div className="address-section mt-3">
                            <h6 className="mb-2">Shipping Address</h6>
                            <p className="mb-0">
                              {order.address.street},<br />
                              {order.address.city}, {order.address.state}
                              <br />
                              {order.address.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 d-flex justify-content-end gap-2">
                      <OrderBill order={order} />

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
