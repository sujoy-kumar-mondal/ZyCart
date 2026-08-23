import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck, Truck, Headphones, ArrowRight, Heart } from "lucide-react";
import { useSettings } from "../context/SettingsProvider";

const Footer = () => {
  const { settings } = useSettings();
  const sellerUrl = import.meta.env.VITE_SELLER_URL || "http://localhost:5174";
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5175";

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Feature Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Free Delivery</h4>
              <p className="text-xs text-slate-400">On orders above {settings.currencySymbol || "₹"}{settings.freeDeliveryThreshold ?? 499}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">100% Genuine</h4>
              <p className="text-xs text-slate-400">Directly from sellers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-slate-400">Hassle-free policy</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">24/7 Support</h4>
              <p className="text-xs text-slate-400">Dedicated assistance</p>
            </div>
          </div>
        </div>

        {/* Middle Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] p-2 flex items-center justify-center">
                <img src="/logo_cart.svg" alt="ZyCart Logo" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
              <span className="text-2xl font-black text-white">
                Zy<span className="text-blue-400">Cart</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.platformName || "ZyCart"} is your next-generation multi-vendor e-commerce platform delivering top-tier quality, transparent pricing, and instant doorstep delivery across categories.
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subscribe to Newsletter</p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 flex-1"
                />
                <button className="p-2.5 bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white rounded-xl hover:opacity-90 transition">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-400 transition">All Products</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-400 transition">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-blue-400 transition">Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/my-orders" className="hover:text-blue-400 transition">Track Orders</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-blue-400 transition">My Account</Link>
              </li>
              <li>
                <Link to="/changepassword" className="hover:text-blue-400 transition">Change Password</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">Help &amp; Support</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">About {settings.platformName || "ZyCart"}</Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Portals */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Portals</h3>
            <p className="text-xs text-slate-400 mb-3">Access merchant &amp; administration platforms:</p>
            
            <div className="space-y-2.5">
              <a
                href={sellerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-bold text-blue-300 hover:text-white transition group"
              >
                <span>🛍️ Seller Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-bold text-red-300 hover:text-white transition group"
              >
                <span>⚙️ Admin Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Credit Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {settings.platformName || "ZyCart"} Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1 font-medium">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for a seamless shopping experience
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
