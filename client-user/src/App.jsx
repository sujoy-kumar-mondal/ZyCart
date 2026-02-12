import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// User Pages
import Home from "./pages/Home.jsx";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import UserOrders from "./pages/UserOrders.jsx";
import UserOrderDetails from "./pages/UserOrderDetails.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Toaster />
      <Navbar />
      <main className="grow container-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetpassword" element={<ForgotPassword />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/my-orders" element={<UserOrders />} />
          <Route path="/my-orders/:orderId" element={<UserOrderDetails />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
