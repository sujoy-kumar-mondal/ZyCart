import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 mt-12 bg-linear-to-br from-red-50 to-orange-50 border-t border-gray-200">
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Branding */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-wide text-red-600 mb-3">
              ZyCart Seller
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Grow your business with ZyCart's powerful seller tools and reach millions of customers.
            </p>
          </div>

          {/* Seller Resources */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Seller Hub</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/seller/products" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Manage Products
                </Link>
              </li>
              <li>
                <Link to="/seller/orders" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller Support */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/seller/apply" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Apply as Seller
                </Link>
              </li>
              <li>
                <Link to="/changepassword" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Change Password
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Seller Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-red-600 transition font-medium">
                  Support Center
                </a>
              </li>
            </ul>
          </div>

          {/* Portals Navigation */}
          <div>
            <h3 className="text-lg font-bold text-[#1B2A41] mb-4">Other Portals</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://zycart.netlify.app/" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-medium px-3 py-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                  🛍️ Customer Portal
                </a>
              </li>
              <li>
                <a href="https://zycart-admin.netlify.app/" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-medium px-3 py-2 bg-red-100 rounded-lg hover:bg-red-200">
                  ⚙️ Admin Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} ZyCart — All rights reserved. | Grow Your Business With ZyCart</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
