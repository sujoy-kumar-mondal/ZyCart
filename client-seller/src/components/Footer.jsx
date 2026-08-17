import React from "react";
import { Link } from "react-router-dom";
import { Store, ShieldCheck, Truck, Headphones, ExternalLink } from "lucide-react";

const Footer = () => {
  const userUrl = import.meta.env.VITE_USER_URL || "http://localhost:5173";
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5175";

  return (
    <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800 mt-20">
      
      {/* Merchant Benefits Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#6A8EF0] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Doorstep Logistics Pickup</h4>
                <p className="text-xs text-slate-400">Automated courier dispatch &amp; delivery tracking</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Guaranteed Payout Settlement</h4>
                <p className="text-xs text-slate-400">Direct weekly bank transfers with 0 hidden fees</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">24/7 Merchant Support</h4>
                <p className="text-xs text-slate-400">Dedicated account executive guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] flex items-center justify-center text-white font-black text-sm shadow-md">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">ZyCart Merchant Portal</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering merchants across India with multi-channel cataloging, automated inventory management, live analytics, and fast payout settlements.
            </p>

            <div className="pt-2 text-xs font-bold text-slate-400 space-y-1">
              <p>📍 Tech Hub, New Delhi, India</p>
              <p>✉️ merchant-support@zycart.com</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Merchant Hub</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/seller/dashboard" className="hover:text-white transition">Seller Dashboard</Link>
              </li>
              <li>
                <Link to="/seller/products" className="hover:text-white transition">Manage Products Catalog</Link>
              </li>
              <li>
                <Link to="/seller/orders" className="hover:text-white transition">Customer Orders &amp; Shipping</Link>
              </li>
              <li>
                <Link to="/seller/profile" className="hover:text-white transition">Store Account Profile</Link>
              </li>
              <li>
                <Link to="/seller/apply" className="hover:text-white transition">Apply as New Seller</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ZyCart Ecosystem Portals */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">ZyCart Network Portals</h3>
            <div className="space-y-2.5">
              <a
                href={userUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition"
              >
                <span>🛍️ Customer Storefront Portal</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>

              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition"
              >
                <span>⚙️ Super Admin Operations Portal</span>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-10 mt-10 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} ZyCart Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition">Seller Policy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
