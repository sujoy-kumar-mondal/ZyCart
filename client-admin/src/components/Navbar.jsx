import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Menu, X, LogOut, Settings, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = () => {
    if (!user?.name) return "A";
    const parts = user.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    toast.success("Logged out successfully");
  };

  const linkClass = "px-3 py-2 font-medium text-gray-700 hover:text-[#3F51F4] transition";
  const activeClass = "text-[#3F51F4] font-semibold border-b-2 border-[#3F51F4]";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link
          to={user ? "/admin/dashboard" : "/"}
          className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-transparent bg-clip-text"
        >
          ZyCart Admin
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {/* Dashboard Link */}
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Dashboard
              </NavLink>

              {/* Users Management Link */}
              <NavLink
                to="/admin/users"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Users
              </NavLink>

              {/* Sellers Management Link */}
              <NavLink
                to="/admin/sellers"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Sellers
              </NavLink>

              {/* Orders Link */}
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Orders
              </NavLink>

              {/* Admin Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-linear-to-br from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition"
                >
                  {getInitials()}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/admin/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>

                      <Link
                        to="/changepassword"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                        Change Password
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 transition border-t border-gray-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg text-white font-medium bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-3">
              {user ? (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Users
                  </NavLink>

                  <NavLink
                    to="/admin/sellers"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Sellers
                  </NavLink>

                  <NavLink
                    to="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Orders
                  </NavLink>

                  <NavLink
                    to="/admin/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    My Profile
                  </NavLink>

                  <NavLink
                    to="/changepassword"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Change Password
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-700 hover:bg-red-50 transition rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-lg text-white font-medium bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
