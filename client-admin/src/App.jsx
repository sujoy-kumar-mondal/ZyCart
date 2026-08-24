import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx";
import AdminSellers from "./pages/admin/AdminSellers.jsx";
import AdminSellerDetails from "./pages/admin/AdminSellerDetails.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminManagement from "./pages/admin/AdminManagement.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

// Auth Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

// Route Guards
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 w-full max-w-full">
      <ScrollToTop />
      <Toaster />
      <Navbar />

      <main className="grow container-main w-full max-w-full">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route
            path="/changepassword"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute permission="manage_users">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute permission="manage_users">
                <AdminUserDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sellers"
            element={
              <ProtectedRoute permission="manage_sellers">
                <AdminSellers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sellers/:sellerId"
            element={
              <ProtectedRoute permission="manage_sellers">
                <AdminSellerDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute permission="manage_orders">
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute permission="manage_orders">
                <AdminOrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute permission="manage_products">
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute permission="manage_categories">
                <AdminCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/admins"
            element={
              <ProtectedRoute permission="manage_admins">
                <AdminManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute permission="system_settings">
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
