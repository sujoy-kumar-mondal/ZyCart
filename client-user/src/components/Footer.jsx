import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 mt-12 bg-linear-to-br from-indigo-50 to-blue-50 border-t border-gray-200">
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Branding */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-wide text-indigo-600 mb-3">
              ZyCart
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Discover endless shopping possibilities with thousands of products from trusted sellers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Shopping</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-indigo-600 transition font-medium">
                  My Orders
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
                <a href="https://zycart-seller.netlify.app/" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium px-3 py-2 bg-indigo-100 rounded-lg hover:bg-indigo-200">
                  🛍️ Seller Portal
                </a>
              </li>
              <li>
                <a href="https://zycart-admin.netlify.app/" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition font-medium px-3 py-2 bg-red-100 rounded-lg hover:bg-red-200">
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
