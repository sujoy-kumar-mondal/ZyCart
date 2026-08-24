import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Store, ArrowRight } from "lucide-react";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem("zycart_saved_seller_email") || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("zycart_saved_seller_email"))
  );
  const [step, setStep] = useState(1);
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
    if (rememberMe) {
      localStorage.setItem("zycart_saved_seller_email", form.email);
    } else {
      localStorage.removeItem("zycart_saved_seller_email");
    }
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
        login(loginData, rememberMe);
        toast.success("Merchant login successful!");
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
        login(loginData, rememberMe);
        toast.success("Merchant login successful!");
        navigate("/seller/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Merchant Sign In — ZyCart";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-[#F8FAFC] to-indigo-50/60 py-12 px-4 flex items-center justify-center relative overflow-hidden">
      
      {/* Floating Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
            {step === 1 ? "Merchant Central" : "Security Verification"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            {step === 1
              ? "Sign in to manage inventory & customer orders"
              : `Enter the 6-digit verification code sent to ${form.email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Merchant Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={form.email}
                  required
                  placeholder="seller@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link to="/resetpassword" className="text-xs font-extrabold text-[#3F51F4] hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={handleChange}
                  value={form.password}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 text-[#3F51F4] focus:ring-[#3F51F4] accent-[#3F51F4]"
                />
                <span className="text-xs font-semibold text-slate-600">
                  Remember my email on this device
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Sign In to Dashboard"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                placeholder="000000"
                className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-center tracking-widest text-[#1B2A41] focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md hover:opacity-95 transition text-sm"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center text-xs font-semibold text-slate-500">
          Want to sell on ZyCart?{" "}
          <Link to="/seller/apply" className="font-extrabold text-[#3F51F4] hover:underline">
            Apply as Merchant
          </Link>
        </div>
      </motion.div>

    </div>
  );
};

export default Login;
