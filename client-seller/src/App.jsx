import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Seller Pages
import SellerDashboard from "./pages/seller/SellerDashboard.jsx";
import SellerProducts from "./pages/seller/SellerProducts.jsx";
import SellerProductDetails from "./pages/seller/SellerProductDetails.jsx";
import SellerOrders from "./pages/seller/SellerOrders.jsx";
import SellerOrderDetails from "./pages/seller/SellerOrderDetails.jsx";
import SellerApply from "./pages/seller/SellerApply.jsx";
import SellerProfile from "./pages/seller/SellerProfile.jsx";

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

          {/* Seller Apply (public - for new sellers to register and apply) */}
          <Route
            path="/seller/apply"
            element={<SellerApply />}
          />

          {/* Seller Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/products"
            element={
              <ProtectedRoute>
                <SellerProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/products/:id"
            element={
              <ProtectedRoute>
                <SellerProductDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute>
                <SellerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/orders/:orderId"
            element={
              <ProtectedRoute>
                <SellerOrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/profile"
            element={
              <ProtectedRoute>
                <SellerProfile />
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
