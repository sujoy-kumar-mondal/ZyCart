import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Menu, X, LogOut, Settings, User, Store, Package, ShoppingBag, LayoutDashboard, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!user?.name) return "S";
    const parts = user.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    toast.success("Logged out successfully");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition ${
      isActive
        ? "bg-blue-50 text-[#3F51F4] shadow-xs"
        : "text-slate-600 hover:text-[#3F51F4] hover:bg-slate-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        
        {/* Brand Logo & Merchant Badge */}
        <div className="flex items-center gap-3">
          <Link
            to={user ? "/seller/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-[#1B2A41] tracking-tight">ZyCart</span>
              <span className="text-xs font-extrabold text-[#3F51F4] block -mt-1 uppercase tracking-wider">Merchant Central</span>
            </div>
          </Link>

          {user && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200/80">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Verified Merchant
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/seller/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>

              <NavLink to="/seller/products" className={navLinkClass}>
                <Package className="w-4 h-4" /> My Products
              </NavLink>

              <NavLink to="/seller/orders" className={navLinkClass}>
                <ShoppingBag className="w-4 h-4" /> Customer Orders
              </NavLink>

              {/* User Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100/80 transition"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6A8EF0] to-[#3F51F4] text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                    {getInitials()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-extrabold text-[#1B2A41] line-clamp-1">{user?.name}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{user?.email}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-2 space-y-1 z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-black text-[#1B2A41]">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/seller/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#3F51F4] transition"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Store Profile &amp; Settings
                      </Link>

                      <Link
                        to="/changepassword"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#3F51F4] transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Change Password
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/seller/apply")}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md shadow-blue-500/20 hover:opacity-95 transition transform active:scale-95"
              >
                Apply as Merchant
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-2xl text-slate-700 hover:bg-slate-100 transition"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200/80 px-4 py-4 space-y-2"
          >
            {user ? (
              <>
                <NavLink
                  to="/seller/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-[#3F51F4]" /> Dashboard
                </NavLink>

                <NavLink
                  to="/seller/products"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Package className="w-5 h-5 text-[#3F51F4]" /> My Products
                </NavLink>

                <NavLink
                  to="/seller/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ShoppingBag className="w-5 h-5 text-[#3F51F4]" /> Customer Orders
                </NavLink>

                <NavLink
                  to="/seller/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-5 h-5 text-[#3F51F4]" /> Store Profile
                </NavLink>

                <NavLink
                  to="/changepassword"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-5 h-5 text-slate-400" /> Change Password
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-slate-800 bg-slate-100 text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/seller/apply");
                    setMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-sm shadow-md"
                >
                  Apply as Merchant
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
