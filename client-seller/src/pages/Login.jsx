import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/seller/login", form);

      if (res.data.success) {
        // Normalize response: backend returns 'seller' but login() expects 'user'
        const loginData = {
          token: res.data.token,
          user: res.data.seller,
        };
        
        login(loginData);

        toast.success("Login successful!");
        navigate("/seller/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Login | ZyCart";
  }, []);

  return (
    <>
      <div
        className="
        min-h-screen flex items-center max-w-screen-2xl container mx-auto px-4 md:px-14 justify-center
        bg-linear-to-br from-[#C3F2EC] via-[#8FD6F6] to-[#3F51F4]
        py-12
      "
      >

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="
            w-full max-w-md p-10 
            bg-white rounded-2xl shadow-xl 
            border border-[#8FD6F6]/40
          "
        >
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-center text-[#1B2A41]">
            Welcome Back
          </h1>

          <p className="text-center mt-2 text-gray-600">
            Login to continue your journey
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 mt-8">

            {/* Email */}
            <div>
              <label className="font-medium text-[#1B2A41]">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                value={form.email}
                required
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 
                  bg-[#F7FBFF] text-[#1B2A41]
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-medium text-[#1B2A41]">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={form.password}
                required
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 
                  bg-[#F7FBFF] text-[#1B2A41]
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-xl text-white font-semibold
                bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                hover:opacity-95 transition shadow-lg cursor-pointer disabled:cursor-not-allowed
              "
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className=" flex">
            <p className="text-center mt-6 text-gray-600">
              <Link
                to="/resetpassword"
                className="font-semibold text-[#3F51F4] hover:underline"
              >
                Forgotten password?
              </Link>
            </p>
            <p className="text-center mt-6 text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/seller/apply"
                className="font-semibold text-[#3F51F4] hover:underline"
              >
                Apply as Seller
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
