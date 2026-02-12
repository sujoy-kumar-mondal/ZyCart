import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { Menu, X, Search, Heart, ShoppingCart, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Update search input when URL search parameter changes
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
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
          to="/"
          className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-transparent bg-clip-text"
        >
          ZyCart
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
            />
            <button type="submit" className="text-gray-600 hover:text-[#3F51F4] ml-2">
              <Search className="w-5 h-5" />
            </button>
          </form>

          {user ? (
            <>
              {/* Products Link */}
              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Products
              </NavLink>

              {/* My Orders Link */}
              <NavLink
                to="/my-orders"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Orders
              </NavLink>

              {/* Wishlist Link */}
              <NavLink
                to="/wishlist"
                className="relative px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
              >
                <Heart className="w-5 h-5" fill={(Array.isArray(wishlist) && wishlist.length > 0) ? "currentColor" : "none"} />
                {Array.isArray(wishlist) && wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </NavLink>

              {/* Cart Link */}
              <NavLink
                to="/cart"
                className="relative px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              {/* User Dropdown */}
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
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <User className="w-4 h-4" />
                        My Profile
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
            <>
              <NavLink
                to="/products"
                className={({ isActive }) => (isActive ? activeClass : linkClass)}
              >
                Products
              </NavLink>

              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg text-white font-medium bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-lg border-2 border-[#3F51F4] text-[#3F51F4] hover:bg-[#3F51F4] hover:text-white transition"
              >
                Register
              </button>
            </>
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
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-gray-700 placeholder-gray-500 flex-1"
                />
                <button type="submit" className="text-gray-600 hover:text-[#3F51F4]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {user ? (
                <>
                  <NavLink
                    to="/products"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Products
                  </NavLink>

                  <NavLink
                    to="/my-orders"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    My Orders
                  </NavLink>

                  <NavLink
                    to="/wishlist"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Wishlist ({wishlist.length})
                  </NavLink>

                  <NavLink
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Cart ({totalItems})
                  </NavLink>

                  <NavLink
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    My Profile
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-700 hover:bg-red-50 transition rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/products"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-gray-700 hover:text-[#3F51F4] transition"
                  >
                    Products
                  </NavLink>

                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg text-white font-medium bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => {
                      navigate("/register");
                      setMenuOpen(false);
                    }}
                    className="w-full py-2 rounded-lg border-2 border-[#3F51F4] text-[#3F51F4] hover:bg-[#3F51F4] hover:text-white transition"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
