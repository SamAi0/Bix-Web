import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Product from "./components/Product";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Order from "./components/Order";
import Donate from "./components/Donate";
import DonateMoney from "./components/DonateMoney";
import DonateProduct from "./components/DonateProduct";
import OurStory from "./components/OurStory";
import Feedback from "./components/Feedback";
import Company from "./components/Company";
import Job from "./components/Job";
import ApplyFormForJob from "./components/ApplyFormForJob";
import Profile from "./components/Profile";
import Wishlist from "./components/Wishlist";
import SavedCarts from "./components/SavedCarts";
import AddressBook from "./components/AddressBook";
import ProductComparison from "./components/ProductComparison";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminProducts from "./components/admin/AdminProducts";
import BulkProductUpload from "./components/admin/BulkProductUpload";
import AdminOrders from "./components/admin/AdminOrders";
import AdminJobs from "./components/admin/AdminJobs";
import AdminCompanies from "./components/admin/AdminCompanies";
import AdminApplicants from "./components/admin/AdminApplicants";
import AdminDonations from "./components/admin/AdminDonations";



function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order" element={<Order />} />
          <Route path="/jobs" element={<Company />} />
          <Route path="/jobs/:companyId" element={<Job />} />
          <Route
            path="/apply/:companyId/:jobId"
            element={<ApplyFormForJob />}
          />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donate-money" element={<DonateMoney />} />
          <Route path="/donate-product" element={<DonateProduct />} />

          <Route path="/our-story" element={<OurStory />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/saved-carts" element={<ProtectedRoute><SavedCarts /></ProtectedRoute>} />
          <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><ProductComparison /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/bulk-upload"
            element={
              <AdminRoute>
                <BulkProductUpload />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <AdminRoute>
                <AdminJobs />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <AdminRoute>
                <AdminCompanies />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/applicants"
            element={
              <AdminRoute>
                <AdminApplicants />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/donate-money"
            element={
              <AdminRoute>
                <AdminDonations type="money" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/donate-products"
            element={
              <AdminRoute>
                <AdminDonations type="product" />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
