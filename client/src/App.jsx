import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// User Pages
import Home from "./pages/Home.jsx";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import UserOrders from "./pages/UserOrders.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

// Supplier Pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard.jsx";
import SupplierProducts from "./pages/supplier/SupplierProducts.jsx";
import SupplierOrders from "./pages/supplier/SupplierOrders.jsx";
import SupplierApply from "./pages/supplier/SupplierApply.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminSuppliers from "./pages/admin/AdminSuppliers.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";

// Route Guards
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      <Navbar />

      <main className="grow container-main">
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/changepassword"
            element={
              <ProtectedRoute roles={["user", "supplier", "admin"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* User Protected Routes */}
          <Route path="/cart"
            element={
              <ProtectedRoute roles={["user"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={["user"]}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute roles={["user"]}>
                <UserOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["user"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* Supplier Apply (only logged-in users with role 'user') */}
          <Route
            path="/supplier/apply"
            element={
              <ProtectedRoute roles={["user"]}>
                <SupplierApply />
              </ProtectedRoute>
            }
          />

          {/* Supplier Routes */}
          <Route
            path="/supplier/dashboard"
            element={
              <ProtectedRoute roles={["supplier"]}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/supplier/products"
            element={
              <ProtectedRoute roles={["supplier"]}>
                <SupplierProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/supplier/orders"
            element={
              <ProtectedRoute roles={["supplier"]}>
                <SupplierOrders />
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
            path="/admin/suppliers"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminSuppliers />
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

        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
