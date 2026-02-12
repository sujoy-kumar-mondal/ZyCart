import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx";
import AdminSellers from "./pages/admin/AdminSellers.jsx";
import AdminSellerDetails from "./pages/admin/AdminSellerDetails.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

// Auth Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

// Route Guards
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      <Navbar />

      <main className="grow container-main">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route
            path="/changepassword"
            element={
              <ProtectedRoute roles={["admin"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUserDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sellers"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSellers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/sellers/:sellerId"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSellerDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminOrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute roles={["admin"]}>
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
