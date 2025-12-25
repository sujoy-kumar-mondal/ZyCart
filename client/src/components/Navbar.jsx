import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = user?.role;

  // Extract initials safely
  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  const linkClass =
    "px-3 py-2 font-medium text-gray-700 hover:text-[#3F51F4] transition";
  const activeClass = "text-[#3F51F4] font-semibold";

  return (
    <nav
      className="
        sticky top-0 z-50 backdrop-blur-md max-w-screen-2xl container mx-auto px-14 flex items-center justify-between h-16
        bg-white/80 border-b border-white/40 shadow-sm
      "
    >

      {/* Logo */}
      <Link
        to="/"
        className="
            text-3xl font-extrabold tracking-tight
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            text-transparent bg-clip-text
          "
      >
        ZyCart
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">

        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          Products
        </NavLink>

        {/* User */}
        {role === "user" && (
          <>
            <NavLink
              to="/my-orders"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              My Orders
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Cart
              {totalItems > 0 && (
                <span
                  className="
                      ml-1 px-2 py-0.5 rounded-full text-xs text-white
                      bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                    "
                >
                  {totalItems}
                </span>
              )}
            </NavLink>
          </>
        )}

        {/* Supplier */}
        {role === "supplier" && (
          <>
            <NavLink
              to="/supplier/dashboard"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/supplier/products"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/supplier/orders"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Orders
            </NavLink>
          </>
        )}

        {/* Admin */}
        {role === "admin" && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/suppliers"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Suppliers
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                isActive ? activeClass : linkClass
              }
            >
              Orders
            </NavLink>
          </>
        )}

        {/* Avatar Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="
                  w-11 h-11 rounded-full flex items-center justify-center
                  text-white font-bold shadow-md select-none
                  bg-linear-to-br from-[#6A8EF0] to-[#3F51F4]
                  hover:opacity-90 transition
                "
            >
              {getInitials()}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="
                      absolute right-0 mt-3 w-52 p-3
                      bg-white shadow-xl rounded-xl border border-gray-200
                    "
                >
                  {/* User Menu */}
                  {role === "user" && (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Profile
                      </Link>

                      <Link
                        to="/supplier/apply"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Become Seller
                      </Link>
                    </>
                  )}

                  {/* Supplier */}
                  {role === "supplier" && (
                    <>
                      <Link
                        to="/supplier/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Supplier Dashboard
                      </Link>
                      <Link
                        to="/changepassword"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Change Password
                      </Link>
                    </>
                  )}

                  {/* Admin */}
                  {role === "admin" && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/changepassword"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Change Password
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="
                        w-full text-left px-3 py-2 mt-2
                        bg-red-50 text-red-700 hover:bg-red-100
                        rounded-lg transition
                      "
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="
                  px-4 py-2 rounded-lg
                  text-white font-medium shadow
                  bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                "
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="
                  px-4 py-2 rounded-lg
                  border border-[#3F51F4] text-[#3F51F4]
                  hover:bg-[#3F51F4] hover:text-white
                  transition
                "
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden flex flex-col top-5 right-25 border rounded-xl shadow-lg border-opacity-50 absolute bg-white/95 p-4 space-y-4"
          >
            <NavLink
              to="/"
              onClick={() => setMenuOpen(false)}
              className={` flex justify-center ${({ isActive }) => (isActive ? activeClass : linkClass)}`}
            >
              Home
            </NavLink>

            {role === "user" && (
              <>
                <NavLink
                  to="/my-orders"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  My Orders
                </NavLink>

                <NavLink
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Cart ({totalItems})
                </NavLink>

                <NavLink
                  to="/supplier/apply"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Become Seller
                </NavLink>
              </>
            )}

            {role === "supplier" && (
              <>
                <NavLink
                  to="/supplier/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/supplier/products"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Products
                </NavLink>

                <NavLink
                  to="/supplier/orders"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/changepassword"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Change Password
                </NavLink>
              </>
            )}

            {role === "admin" && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin/users"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Users
                </NavLink>

                <NavLink
                  to="/admin/suppliers"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Suppliers
                </NavLink>

                <NavLink
                  to="/admin/orders"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/changepassword"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? activeClass : linkClass
                  }
                >
                  Change Password
                </NavLink>
              </>
            )}

            {!user ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login");
                  }}
                  className="
                    w-full py-2 rounded-lg text-white font-medium
                    bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                  "
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/register");
                  }}
                  className="
                    w-full py-2 rounded-lg
                    border border-[#3F51F4] text-[#3F51F4]
                    hover:bg-[#3F51F4] p-2 hover:text-white transition
                  "
                >
                  Register
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/");
                }}
                className="
                  w-full py-2 rounded-lg text-red-700
                  bg-red-50 hover:bg-red-100 transition
                "
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Toggle */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </nav>
  );
};

export default Navbar;
