import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const sellerUrl = import.meta.env.VITE_SELLER_URL || "http://localhost:5174";
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5175";

  return (
    <footer className="py-16 mt-12 bg-linear-to-br from-[#F0F4F8] via-[#E8F1F8] to-[#E0F0F8] border-t border-gray-200">
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Branding */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-wide text-[#3F51F4] mb-3">
              ZyCart
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your one-stop destination for seamless shopping. Quality products from trusted sellers delivered straight to your door.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/my-orders" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/changepassword" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Change Password
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Portals Navigation */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Other Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={sellerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium px-3 py-2 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                  🛍️ Seller Portal
                </a>
              </li>
              <li>
                <a href={adminUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium px-3 py-2 bg-red-100 rounded-lg hover:bg-red-200">
                  ⚙️ Admin Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} ZyCart — All rights reserved. | Easy Shop, Easy Life</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
