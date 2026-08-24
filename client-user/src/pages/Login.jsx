import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance.js";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Truck,
  RotateCcw,
  Star,
  Zap,
  Shield,
  KeyRound,
  ExternalLink
} from "lucide-react";

const Login = () => {
  const { user, login } = useAuth();
  const { settings, stats } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: localStorage.getItem("zycart_saved_email") || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(
    Boolean(localStorage.getItem("zycart_saved_email"))
  );
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    document.title = "Customer Sign In | ZyCart Premium Store";
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Resend cooldown timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error("Please provide both email and password.");
    }

    if (rememberMe) {
      localStorage.setItem("zycart_saved_email", form.email);
    } else {
      localStorage.removeItem("zycart_saved_email");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/user/login", form);

      if (res.data.requireOtp) {
        toast.success(res.data.message || "Password verified! 2FA OTP sent to your email.");
        setStep(2);
        setResendCooldown(60);
        // Focus first OTP input on next tick
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else if (res.data.success) {
        login(res.data, rememberMe);
        toast.success("Welcome back! Login successful.");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Changes
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otpValues];

    if (cleaned.length > 1) {
      // User pasted multiple digits into one field
      const digits = cleaned.slice(0, 6).split("");
      digits.forEach((d, idx) => {
        if (index + idx < 6) newOtp[index + idx] = d;
      });
      setOtpValues(newOtp);
      const nextIdx = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtpValues(newOtp);

    // Auto-advance to next input
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otpValues];
      pastedData.split("").forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtpValues(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpValues.join("").trim();
    if (fullOtp.length !== 6) {
      return toast.error("Please enter the complete 6-digit verification code!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/user/verify-login-otp", {
        email: form.email,
        otp: fullOtp,
      });

      if (res.data.success) {
        login(res.data, rememberMe);
        toast.success("2FA Security verified! Welcome to ZyCart.");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP code!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await axios.post("/auth/user/login", form);
      if (res.data.success || res.data.requireOtp) {
        toast.success("A fresh 2FA code has been sent to your email!");
        setResendCooldown(60);
        setOtpValues(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-[#3F51F4] selection:text-white">
      
      {/* Background Animated Ambient Lights & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3F51F4_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-[#3F51F4]/25 to-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Main Dual-Column Container */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Hero Experience & Brand Showcase (Desktop only) */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#121929] via-[#0F172A] to-[#1E1B4B] p-8 sm:p-12 lg:p-14 flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/70 overflow-hidden">
            
            {/* Top Glow Highlights */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Brand Logo & Tag */}
            <div className="space-y-6 relative z-10">
              <Link to="/" className="inline-flex items-center gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3F51F4] via-[#5C72FF] to-[#8FD6F6] p-2.5 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <img
                    src="/logo_cart.svg"
                    alt="ZyCart Logo"
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                    ZyCart <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/20 text-[#6A8EF0] border border-blue-500/30">User</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    Premium Shopping Central
                  </span>
                </div>
              </Link>

              <div className="space-y-3 pt-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#8FD6F6]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Exclusive Shopper Ecosystem
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Seamless access to millions of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A8EF0] via-[#8FD6F6] to-cyan-300">verified products.</span>
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
                  Sign in to track ongoing orders in real-time, view verified merchant ratings, manage your wishlist, and enjoy instant express checkout.
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-8 relative z-10">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-[#6A8EF0] flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Live Tracking</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Packed to door milestone alerts</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">2FA Security</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Protected account transactions</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Lightning Deals</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Member-only flash discounts</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Verified Reviews</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% genuine buyer ratings</p>
                </div>
              </div>
            </div>

            {/* Bottom Trust Stat & Back Link */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-blue-400 to-indigo-500"></div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-purple-400 to-pink-500"></div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-emerald-400 to-teal-500"></div>
                </div>
                <span>{stats?.happyShoppers ? `${stats.happyShoppers.toLocaleString()} Registered Shoppers` : "Verified Shopper Community"}</span>
              </div>

              <Link to="/" className="text-[#8FD6F6] hover:text-white transition flex items-center gap-1">
                Return to Store <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: Interactive Auth Form (Login & 2FA OTP) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 bg-white text-slate-900 p-6 sm:p-10 lg:p-14 flex flex-col justify-center relative">
            
            <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-7">
              
              {/* Mobile Branded Header (visible on < lg screens) */}
              <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-100">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] p-2 shadow-md shadow-blue-500/20 flex items-center justify-center">
                    <img
                      src="/logo_cart.svg"
                      alt="ZyCart Logo"
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </div>
                  <span className="text-xl font-black text-[#1B2A41]">ZyCart</span>
                </Link>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#3F51F4] border border-blue-100">
                  Customer Sign In
                </span>
              </div>
              
              {/* Form Title & Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#3F51F4]">
                    {step === 1 ? "Step 01 / 02 • Authorization" : "Step 02 / 02 • Two-Factor Auth"}
                  </div>
                  <div className="flex gap-1.5">
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[#3F51F4]" : "bg-slate-200"}`}></div>
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-[#3F51F4]" : "bg-slate-200"}`}></div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41] tracking-tight">
                  {step === 1 ? "Sign in to your account" : "Two-Factor Verification"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {step === 1
                    ? "Enter your verified credentials to access your customer profile."
                    : `We've sent a 6-digit authentication code to ${form.email}`}
                </p>
              </div>

              {/* AnimatePresence for smooth multi-step transition */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  /* ========================================================= */
                  /* STEP 1: Email & Password Input Form */
                  /* ========================================================= */
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleLogin}
                    className="space-y-4 pt-1"
                  >
                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                          placeholder="name@example.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                        <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-[#3F51F4] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <Link
                          to="/resetpassword"
                          className="text-xs font-extrabold text-[#3F51F4] hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          autoComplete="current-password"
                          placeholder="••••••••••••"
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                        <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#3F51F4] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] shadow-lg shadow-orange-500/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Authenticating...</span>
                        </div>
                      ) : (
                        <>
                          <span>Sign In Securely</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  /* ========================================================= */
                  /* STEP 2: 2-Factor Authentication 6-Digit OTP Form */
                  /* ========================================================= */
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-6 pt-1"
                  >
                    {/* Security Notice Pill */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#3F51F4] text-white flex items-center justify-center shrink-0">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-extrabold text-[#1B2A41]">2FA Security Protection</p>
                        <p className="text-slate-500 font-medium">
                          We sent a 6-digit code to <span className="font-bold text-slate-800">{form.email}</span>. Valid for 5 minutes.
                        </p>
                      </div>
                    </div>

                    {/* 6-Box Formatted OTP Inputs */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                        Enter 6-Digit Passcode
                      </label>
                      
                      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                        {otpValues.map((val, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={val}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-[#1B2A41] bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition-all duration-200"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend OTP Link & Countdown */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                      <span>Didn't receive the passcode?</span>
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-bold">
                          Resend in <span className="text-[#3F51F4]">{resendCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resending}
                          className="font-extrabold text-[#3F51F4] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {resending ? "Sending code..." : "Resend Code"}
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setOtpValues(["", "", "", "", "", ""]);
                        }}
                        className="w-1/3 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Change Email
                      </button>

                      <button
                        type="submit"
                        disabled={loading || otpValues.join("").length !== 6}
                        className="w-2/3 py-3.5 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Verifying..." : "Verify & Complete Login"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Social Login / Alternatives Divider */}
              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Badges */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toast("Google SSO is coming soon in the next release!", { icon: "🔒" })}
                  className="py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => toast("Apple Sign-In is coming soon in the next release!", { icon: "🍎" })}
                  className="py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 text-xs flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.88-.93.04-2.05.62-2.71 1.4-.58.67-1.09 1.77-.96 2.81 1.04.08 2.07-.55 2.71-1.33z" />
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Bottom Nav Links */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                <p>
                  New to ZyCart?{" "}
                  <Link to="/register" className="font-extrabold text-[#3F51F4] hover:underline">
                    Create free account
                  </Link>
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
