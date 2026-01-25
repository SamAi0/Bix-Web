import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    counts: {
      users: 0,
      products: 0,
      orders: 0,
      jobs: 0,
      companies: 0,
      applicants: 0,
      moneyDonations: 0,
      productDonations: 0,
    },
    orderStats: {
      totalRevenue: 0,
      averageOrderValue: 0,
      pendingOrders: 0,
    },
    productStats: {
      totalValue: 0,
      outOfStock: 0,
    },
    donationStats: {
      money: {
        totalAmount: 0,
        averageDonation: 0,
      },
      products: [],
    },
    recentActivity: {
      orders: [],
      applications: [],
    },
    // New analytics data
    monthlySales: [],
    categoryDistribution: [],
    userGrowth: [],
    orderStatusDistribution: []
  });

  // Sample data for charts (in real app, this would come from API)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Sample monthly sales data
  const monthlySalesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 2000 },
    { month: 'Apr', sales: 2780 },
    { month: 'May', sales: 1890 },
    { month: 'Jun', sales: 2390 },
  ];
  
  // Sample category distribution
  const categoryData = [
    { name: 'Frames', value: 400 },
    { name: 'Wall Hanging', value: 300 },
    { name: 'Bag', value: 300 },
    { name: 'Jewellery', value: 200 },
    { name: 'Others', value: 200 },
  ];
  
  // Sample order status distribution
  const orderStatusData = [
    { name: 'Pending', value: 25 },
    { name: 'Processing', value: 15 },
    { name: 'Shipped', value: 40 },
    { name: 'Delivered', value: 180 },
    { name: 'Cancelled', value: 10 },
  ];

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error fetching dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Set up refresh interval
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.counts.users,
      icon: "fas fa-users",
      color: "primary",
      link: "/admin/users",
    },
    {
      title: "Products",
      value: stats.counts.products,
      icon: "fas fa-box",
      color: "success",
      subtext: `${stats.productStats.outOfStock} out of stock`,
      link: "/admin/products",
    },
    {
      title: "Orders",
      value: stats.counts.orders,
      icon: "fas fa-shopping-cart",
      color: "info",
      subtext: `${stats.orderStats.pendingOrders} pending`,
      link: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `₹${stats.orderStats.totalRevenue.toFixed(2)}`,
      icon: "fas fa-rupee-sign",
      color: "warning",
      subtext: `Avg. order: ₹${stats.orderStats.averageOrderValue.toFixed(2)}`,
    },
    {
      title: "Companies",
      value: stats.counts.companies,
      icon: "fas fa-building",
      color: "danger",
      link: "/admin/companies",
    },
    {
      title: "Job Applications",
      value: stats.counts.applicants,
      icon: "fas fa-user-tie",
      color: "primary",
      link: "/admin/applicants",
    },
    {
      title: "Money Donations",
      value: stats.counts.moneyDonations,
      icon: "fas fa-hand-holding-usd",
      color: "success",
      subtext: `Total: ₹${stats.donationStats.money.totalAmount.toFixed(2)}`,
      link: "/admin/donate-money",
    },
    {
      title: "Product Donations",
      value: stats.counts.productDonations,
      icon: "fas fa-gift",
      color: "info",
      link: "/admin/donate-products",
    },
  ];

  if (loading) {
    return (
      <div
        className="container-fluid d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate order progress metrics
  const totalOrders = stats.counts.orders;
  const pendingOrders = stats.orderStats.pendingOrders;
  const processingOrders = stats.orderStatusDistribution.find(item => item._id === "Processing")?.count || 0;
  const shippedOrders = stats.orderStatusDistribution.find(item => item._id === "Shipped")?.count || 0;
  const outForDeliveryOrders = stats.orderStatusDistribution.find(item => item._id === "Out for Delivery")?.count || 0;
  const deliveredOrders = stats.orderStatusDistribution.find(item => item._id === "Delivered")?.count || 0;
  const cancelledOrders = stats.orderStatusDistribution.find(item => item._id === "Cancelled")?.count || 0;
  
  // Determine status indicators
  const activeOrders = processingOrders + shippedOrders + outForDeliveryOrders;
  const stuckOrders = pendingOrders > 10 ? 'high' : pendingOrders > 5 ? 'medium' : 'low'; // Example logic
  
  return (
    <div className="container-fluid px-4">
      {/* Order Progress Summary - Prominent Top Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-start border-primary border-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="card-title text-primary mb-1">
                    <i className="fas fa-tachometer-alt me-2"></i>Order Progress Overview
                  </h4>
                  <p className="card-text text-muted mb-0">
                    Real-time tracking of order workflow status across the platform
                  </p>
                </div>
                <div className="text-end">
                  <h3 className="text-dark mb-0">{totalOrders}</h3>
                  <span className="text-muted">Total Orders</span>
                </div>
              </div>
              
              <div className="row mt-4">
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className={`fs-4 fw-bold ${pendingOrders > 0 ? 'text-warning' : 'text-muted'}`}>
                      {pendingOrders}
                    </div>
                    <div className="small text-muted">Pending</div>
                  </div>
                </div>
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className={`fs-4 fw-bold ${processingOrders > 0 ? 'text-info' : 'text-muted'}`}>
                      {processingOrders}
                    </div>
                    <div className="small text-muted">Processing</div>
                  </div>
                </div>
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className={`fs-4 fw-bold ${shippedOrders > 0 ? 'text-primary' : 'text-muted'}`}>
                      {shippedOrders}
                    </div>
                    <div className="small text-muted">Shipped</div>
                  </div>
                </div>
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className={`fs-4 fw-bold ${outForDeliveryOrders > 0 ? 'text-warning' : 'text-muted'}`}>
                      {outForDeliveryOrders}
                    </div>
                    <div className="small text-muted">Out for Delivery</div>
                  </div>
                </div>
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-success">
                      {deliveredOrders}
                    </div>
                    <div className="small text-muted">Delivered</div>
                  </div>
                </div>
                <div className="col-md-2 col-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-danger">
                      {cancelledOrders}
                    </div>
                    <div className="small text-muted">Cancelled</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between">
                  <div>
                    <span className="me-3">
                      <i className="fas fa-circle text-info me-1"></i>
                      Active: <strong>{activeOrders}</strong> orders in progress
                    </span>
                    <span>
                      <i className={`fas fa-circle ${stuckOrders === 'high' ? 'text-danger' : stuckOrders === 'medium' ? 'text-warning' : 'text-success'} me-1`}></i>
                      Stuck: <strong>{pendingOrders}</strong> pending orders
                    </span>
                  </div>
                  <div>
                    <a href="/admin/orders" className="btn btn-primary">
                      View All Orders <i className="fas fa-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        {statCards.map((card, index) => (
          <div key={index} className="col-sm-6 col-xl-3">
            <div className={`card bg-${card.color} text-white h-100`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="card-title mb-0">{card.title}</h6>
                    <h2 className="mt-2 mb-0">{card.value}</h2>
                    {card.subtext && (
                      <small className="opacity-75">{card.subtext}</small>
                    )}
                  </div>
                  <div>
                    <i className={`${card.icon} fa-2x opacity-75`}></i>
                  </div>
                </div>
                {card.link && (
                  <a
                    href={card.link}
                    className="mt-3 btn btn-sm btn-light bg-white text-dark w-100"
                  >
                    View Details <i className="fas fa-arrow-right ms-1"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <a href="/admin/orders" className="btn btn-sm btn-primary">
                View All
              </a>
            </div>
            <div className="card-body">
              {stats.recentActivity.orders.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivity.orders.map((order) => (
                    <div key={order._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{order.username}</h6>
                          <small className="text-muted">
                            {new Date(order.orderDate).toLocaleString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <div>₹{order.totalAmount.toFixed(2)}</div>
                          <span
                            className={`badge bg-${
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "Cancelled"
                                ? "danger"
                                : order.status === "Processing"
                                ? "warning"
                                : "primary"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No recent orders</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Applications</h5>
              <a href="/admin/applicants" className="btn btn-sm btn-primary">
                View All
              </a>
            </div>
            <div className="card-body">
              {stats.recentActivity.applications.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.recentActivity.applications.map((application) => (
                    <div key={application._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{application.name}</h6>
                          <small className="text-muted">
                            {application.companyId?.name} -{" "}
                            {application.jobId?.title}
                          </small>
                        </div>
                        <a
                          href={`mailto:${application.email}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="fas fa-envelope me-1"></i>
                          Contact
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No recent applications</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row mb-4">
        <div className="col-md-8 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Monthly Sales Trend</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#0088FE" name="Sales (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Product Categories</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Performance Metrics</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <div className="border rounded p-3 text-center bg-light">
                    <i className="fas fa-percentage fa-2x text-primary mb-2"></i>
                    <h6 className="mb-1">Conversion Rate</h6>
                    <h4 className="mb-0">3.2%</h4>
                    <small className="text-muted">Last 30 days</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 text-center bg-light">
                    <i className="fas fa-users fa-2x text-success mb-2"></i>
                    <h6 className="mb-1">New Users</h6>
                    <h4 className="mb-0">+127</h4>
                    <small className="text-muted">This month</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 text-center bg-light">
                    <i className="fas fa-star fa-2x text-warning mb-2"></i>
                    <h6 className="mb-1">Avg. Rating</h6>
                    <h4 className="mb-0">4.6/5</h4>
                    <small className="text-muted">Overall</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 text-center bg-light">
                    <i className="fas fa-sync-alt fa-2x text-info mb-2"></i>
                    <h6 className="mb-1">Repeat Customers</h6>
                    <h4 className="mb-0">68%</h4>
                    <small className="text-muted">Retention rate</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Statistics */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Money Donations Overview</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-6">
                  <div className="border rounded p-3 text-center">
                    <h6 className="text-muted mb-2">Total Donations</h6>
                    <h3 className="mb-0">
                      ₹{stats.donationStats.money.totalAmount.toFixed(2)}
                    </h3>
                  </div>
                </div>
                <div className="col-6">
                  <div className="border rounded p-3 text-center">
                    <h6 className="text-muted mb-2">Average Donation</h6>
                    <h3 className="mb-0">
                      ₹{stats.donationStats.money.averageDonation.toFixed(2)}
                    </h3>
                  </div>
                </div>
              </div>
              <a
                href="/admin/donate-money"
                className="btn btn-primary w-100 mt-4"
              >
                View All Money Donations
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Product Donations by Category</h5>
            </div>
            <div className="card-body">
              {stats.donationStats.products.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total Items</th>
                        <th>Donors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.donationStats.products.map((category) => (
                        <tr key={category._id}>
                          <td>{category._id}</td>
                          <td>{category.totalQuantity}</td>
                          <td>{category.donorCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No product donations data available
                </p>
              )}
              <a
                href="/admin/donate-products"
                className="btn btn-primary w-100 mt-3"
              >
                View All Product Donations
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-3">
                  <a
                    href="/admin/products"
                    className="btn btn-light border w-100 p-4"
                  >
                    <i className="fas fa-plus-circle fa-2x mb-3 d-block"></i>
                    Add New Product
                  </a>
                </div>
                <div className="col-md-3">
                  <a
                    href="/admin/orders?status=pending"
                    className="btn btn-light border w-100 p-4"
                  >
                    <i className="fas fa-clock fa-2x mb-3 d-block"></i>
                    View Pending Orders
                  </a>
                </div>
                <div className="col-md-3">
                  <a
                    href="/admin/jobs"
                    className="btn btn-light border w-100 p-4"
                  >
                    <i className="fas fa-briefcase fa-2x mb-3 d-block"></i>
                    Post New Job
                  </a>
                </div>
                <div className="col-md-3">
                  <a
                    href="/admin/donate-money"
                    className="btn btn-light border w-100 p-4"
                  >
                    <i className="fas fa-hand-holding-heart fa-2x mb-3 d-block"></i>
                    Manage Donations
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="position-fixed bottom-0 end-0 p-4">
        <button
          className="btn btn-primary rounded-circle shadow"
          onClick={fetchStats}
          disabled={loading}
          title="Refresh Dashboard"
        >
          <i
            className={`fas ${loading ? "fa-spinner fa-spin" : "fa-sync-alt"}`}
          ></i>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
