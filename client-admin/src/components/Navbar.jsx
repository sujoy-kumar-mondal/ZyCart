import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import { Menu, X, LogOut, Settings, User, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    if (!user?.name) return "A";
    const parts = user.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    toast.success("Logged out from Admin Operations");
  };

  const linkClass = "px-4 py-2 rounded-xl text-xs font-extrabold text-slate-600 hover:text-[#3F51F4] hover:bg-blue-50/80 transition flex items-center gap-1.5";
  const activeClass = "px-4 py-2 rounded-xl text-xs font-black text-[#3F51F4] bg-blue-50 border border-blue-100 shadow-xs flex items-center gap-1.5";

  const isSuperAdmin = user?.role === "super_admin";
  const hasPerm = (perm) => isSuperAdmin || (user?.permissions && user.permissions.includes(perm));

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
        
        {/* Brand Logo & Operations Badge */}
        <div className="flex items-center gap-3">
          <Link
            to={user ? "/admin/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#1B2A41]">{settings?.platformName || "ZyCart"}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3F51F4]">Admin Portal</span>
            </div>
          </Link>

          {user && (
            <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
              isSuperAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
            }`}>
              {isSuperAdmin ? "Super Admin" : "Sub-Admin"}
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                Dashboard
              </NavLink>

              {hasPerm("manage_sellers") && (
                <NavLink to="/admin/sellers" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Sellers
                </NavLink>
              )}

              {hasPerm("manage_users") && (
                <NavLink to="/admin/users" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Users
                </NavLink>
              )}

              {hasPerm("manage_orders") && (
                <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Orders
                </NavLink>
              )}

              {hasPerm("manage_products") && (
                <NavLink to="/admin/products" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Products
                </NavLink>
              )}

              {hasPerm("manage_categories") && (
                <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Categories
                </NavLink>
              )}

              {(isSuperAdmin || hasPerm("manage_admins")) && (
                <NavLink to="/admin/admins" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Sub-Admins
                </NavLink>
              )}

              {hasPerm("system_settings") && (
                <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? activeClass : linkClass)}>
                  Settings
                </NavLink>
              )}

              {/* Profile Avatar Dropdown */}
              <div ref={dropdownRef} className="relative ml-3">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full font-black text-xs text-white bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] hover:opacity-90 transition shadow-md shadow-blue-500/20 flex items-center justify-center cursor-pointer"
                >
                  {getInitials()}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden space-y-1 p-2"
                    >
                      <div className="px-3 py-2.5 bg-slate-50 rounded-xl">
                        <p className="font-extrabold text-xs text-[#1B2A41] truncate">{user?.name}</p>
                        <p className="text-[10px] font-semibold text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/admin/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                      >
                        <User className="w-4 h-4 text-[#3F51F4]" />
                        My Profile
                      </Link>

                      <Link
                        to="/changepassword"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                      >
                        <Settings className="w-4 h-4 text-[#3F51F4]" />
                        Change Password
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-md shadow-blue-500/20 transition"
            >
              Admin Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200/80 px-4 py-4 space-y-2"
          >
            {user ? (
              <>
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </NavLink>

                {hasPerm("manage_sellers") && (
                  <NavLink
                    to="/admin/sellers"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Sellers
                  </NavLink>
                )}

                {hasPerm("manage_users") && (
                  <NavLink
                    to="/admin/users"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Users
                  </NavLink>
                )}

                {hasPerm("manage_orders") && (
                  <NavLink
                    to="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Global Orders
                  </NavLink>
                )}

                {hasPerm("manage_products") && (
                  <NavLink
                    to="/admin/products"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Products
                  </NavLink>
                )}

                {hasPerm("manage_categories") && (
                  <NavLink
                    to="/admin/categories"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Categories
                  </NavLink>
                )}

                {(isSuperAdmin || hasPerm("manage_admins")) && (
                  <NavLink
                    to="/admin/admins"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Sub-Admins
                  </NavLink>
                )}

                {hasPerm("system_settings") && (
                  <NavLink
                    to="/admin/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    System Settings
                  </NavLink>
                )}

                <NavLink
                  to="/admin/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  My Profile
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-extrabold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl text-white font-extrabold text-xs bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4]"
              >
                Admin Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </header>
  );
};

export default Navbar;
