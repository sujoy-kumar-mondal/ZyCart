import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [step, setStep] = useState(1); // Step 1: Email/Password, Step 2: 2FA OTP
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/seller/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/auth/seller/login", form);

      if (res.data.requireOtp) {
        toast.success(res.data.message || "Password verified! OTP sent to email.");
        setStep(2);
      } else if (res.data.success) {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP!");

    setLoading(true);

    try {
      const res = await axios.post("/auth/seller/verify-login-otp", {
        email: form.email,
        otp: otp.trim(),
      });

      if (res.data.success) {
        const loginData = {
          token: res.data.token,
          user: res.data.seller,
        };
        login(loginData);
        toast.success("Login successful!");
        navigate("/seller/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Seller Login | ZyCart";
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
            {step === 1 ? "Seller Portal Login" : "Security Verification"}
          </h1>

          <p className="text-center mt-2 text-gray-600">
            {step === 1
              ? "Login to manage your shop"
              : `Enter the 6-digit OTP sent to ${form.email}`}
          </p>

          {/* Form Step 1: Email + Password */}
          {step === 1 ? (
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
                  placeholder="Enter your seller email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="font-medium text-[#1B2A41]">Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    value={form.password}
                    required
                    className="
                      w-full px-4 py-3 pr-12 rounded-xl
                      border border-[#8FD6F6]/40 
                      bg-[#F7FBFF] text-[#1B2A41]
                      placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                      transition
                    "
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#3F51F4] transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
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
                {loading ? "Verifying Password..." : "Verify & Continue"}
              </motion.button>
            </form>
          ) : (
            /* Form Step 2: 2FA OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-6 mt-8">
              <div>
                <label className="font-medium text-[#1B2A41]">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  className="
                    w-full mt-2 px-4 py-3 rounded-xl
                    border border-[#8FD6F6]/40 
                    bg-[#F7FBFF] text-[#1B2A41] text-center text-2xl tracking-widest font-bold
                    focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                    transition
                  "
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading}
                  className="
                    w-2/3 py-3 rounded-xl text-white font-semibold
                    bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                    hover:opacity-95 transition shadow-lg cursor-pointer disabled:cursor-not-allowed
                  "
                >
                  {loading ? "Logging in..." : "Verify OTP & Login"}
                </motion.button>
              </div>
            </form>
          )}

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
              Don't have an account?{" "}
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
