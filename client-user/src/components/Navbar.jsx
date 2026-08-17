import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { Menu, X, Search, Heart, ShoppingCart, LogOut, User, Package, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setSearchQuery(urlSearch);
  }, [searchParams]);

  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    toast.success("Logged out successfully");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] p-2.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform flex items-center justify-center">
              <img src="/logo_cart.svg" alt="ZyCart Logo" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#1B2A41] leading-none">
                Zy<span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">Cart</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Premium Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Search thousands of products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100/80 border border-slate-200 rounded-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Desktop Nav Links & Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `text-sm font-bold transition px-3 py-2 rounded-xl ${
                  isActive ? "text-[#3F51F4] bg-blue-50/80" : "text-slate-700 hover:text-[#3F51F4] hover:bg-slate-50"
                }`
              }
            >
              Explore Catalog
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-bold transition px-3 py-2 rounded-xl ${
                  isActive ? "text-[#3F51F4] bg-blue-50/80" : "text-slate-700 hover:text-[#3F51F4] hover:bg-slate-50"
                }`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-bold transition px-3 py-2 rounded-xl ${
                  isActive ? "text-[#3F51F4] bg-blue-50/80" : "text-slate-700 hover:text-[#3F51F4] hover:bg-slate-50"
                }`
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {user ? (
              <>
                {/* Wishlist Icon */}
                <NavLink
                  to="/wishlist"
                  className="relative p-2.5 rounded-full text-slate-700 hover:text-red-500 hover:bg-red-50 transition transform active:scale-95"
                  title="My Wishlist"
                >
                  <Heart className="w-5 h-5" fill={Array.isArray(wishlist) && wishlist.length > 0 ? "currentColor" : "none"} />
                  {Array.isArray(wishlist) && wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </NavLink>

                {/* Cart Icon */}
                <NavLink
                  to="/cart"
                  className="relative p-2.5 rounded-full text-slate-700 hover:text-[#3F51F4] hover:bg-blue-50 transition transform active:scale-95"
                  title="My Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white text-[11px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </NavLink>

                {/* User Dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100/80 border border-slate-200/80 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                      {getInitials()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden z-50 p-2 space-y-1"
                      >
                        <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-1">
                          <p className="font-extrabold text-sm text-[#1B2A41] truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>

                        <Link
                          to="/my-orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          My Orders
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left mt-1"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-md shadow-blue-500/20 transition transform active:scale-95"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-4 space-y-4 shadow-xl"
          >
            {/* Search Input Mobile */}
            <form onSubmit={handleSearch} className="flex items-center bg-slate-100 rounded-full px-4 py-2.5">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 flex-1 font-medium"
              />
              <button type="submit" className="text-slate-500 hover:text-[#3F51F4]">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1">
              <NavLink
                to="/products"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
              >
                Explore Catalog
              </NavLink>

              {user && (
                <>
                  <NavLink
                    to="/my-orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
                  >
                    My Orders
                  </NavLink>
                  <NavLink
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
                  >
                    Wishlist ({wishlist.length})
                  </NavLink>
                  <NavLink
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
                  >
                    Cart ({totalItems})
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
                  >
                    My Profile
                  </NavLink>
                </>
              )}

              <NavLink
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition text-sm"
              >
                Contact &amp; Support
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
