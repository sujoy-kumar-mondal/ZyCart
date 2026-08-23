import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Truck,
  Zap,
  Star,
  KeyRound,
  Check,
  RefreshCw,
  ShoppingBag,
  ExternalLink
} from "lucide-react";

const Register = () => {
  const { user } = useAuth();
  const { settings, stats } = useSettings();
  const navigate = useNavigate();

  const brandName = settings?.platformName || "ZyCart";

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
    document.title = `Create Account | ${brandName}`;
  }, [user, navigate, brandName]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Password validation helpers
  const pwd = form.password;
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

  // ---------------------------------------------------------
  // Step 1: Send OTP to Email
  // ---------------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return toast.error("Email address is required!");
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return toast.error("Please enter a valid email address!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/send-otp", { email: cleanEmail });

      if (res.data.success) {
        toast.success(`Verification code sent to ${cleanEmail}`);
        setStep(2);
        setResendCooldown(60);
        setOtpValues(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 300);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Step 2: Resend OTP
  // ---------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await axios.post("/auth/send-otp", { email: email.trim().toLowerCase() });
      if (res.data.success) {
        toast.success("A fresh verification code has been sent!");
        setResendCooldown(60);
        setOtpValues(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  // ---------------------------------------------------------
  // OTP Input Navigation Handlers
  // ---------------------------------------------------------
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    if (value && index < 5) {
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
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otpValues];
      pastedData.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtpValues(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // ---------------------------------------------------------
  // Step 2: Verify OTP + Complete Registration
  // ---------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join("").trim();

    if (fullOtp.length !== 6) {
      return toast.error("Please enter the complete 6-digit verification code!");
    }
    if (!form.name.trim()) {
      return toast.error("Please enter your full name!");
    }
    if (!form.mobile.trim() || form.mobile.length < 10) {
      return toast.error("Please enter a valid 10-digit mobile number!");
    }
    if (!isPasswordValid) {
      return toast.error("Please fulfill all password requirements!");
    }
    if (!agreeTerms) {
      return toast.error("Please accept the Terms of Service to continue!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });

      if (res.data.success) {
        toast.success("Account created successfully! Please sign in.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification or registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-[#3F51F4] selection:text-white">
      
      {/* Background Animated Ambient Lights & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3F51F4_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-[#3F51F4]/25 to-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Main Dual-Column Split Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          
          {/* ========================================================= */}
          {/* LEFT SIDE: Brand Experience & Perks Showcase (Desktop) */}
          {/* ========================================================= */}
          <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#121929] via-[#0F172A] to-[#1E1B4B] p-8 sm:p-12 lg:p-14 flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/70 overflow-hidden">
            
            {/* Top Glow Highlight */}
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
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> New Shopper Registration
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Join millions enjoying <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A8EF0] via-[#8FD6F6] to-cyan-300">verified products & fast delivery.</span>
                </h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg">
                  Create your customer account to unlock personalized recommendations, seamless order tracking, priority checkout, and member perks.
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
                  <h4 className="text-xs font-extrabold text-white">Express Delivery</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Quick doorstep shipping with alerts</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Buyer Protection</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">100% money-back & safe checkouts</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Member Perks</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Early access to top flash deals</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 backdrop-blur-md flex items-start gap-3 hover:border-slate-600/60 transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Verified Reviews</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Real feedback from actual buyers</p>
                </div>
              </div>
            </div>

            {/* Bottom Trust Stat & Login Link */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-blue-400 to-indigo-500"></div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-purple-400 to-pink-500"></div>
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-emerald-400 to-teal-500"></div>
                </div>
                <span>{stats?.happyShoppers ? `${stats.happyShoppers.toLocaleString()} Registered Shoppers` : "Verified Shopper Community"}</span>
              </div>

              <Link to="/login" className="text-[#8FD6F6] hover:text-white transition flex items-center gap-1">
                Already registered? Sign In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: Interactive Auth Form (Register & OTP) */}
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
                  New Customer
                </span>
              </div>
              
              {/* Form Title & Progress Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#3F51F4]">
                    {step === 1 ? "Step 01 / 02 • Email Verification" : "Step 02 / 02 • Profile & Security"}
                  </div>
                  <div className="flex gap-1.5">
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "bg-[#3F51F4]" : "bg-slate-200"}`}></div>
                    <div className={`w-8 h-1.5 rounded-full transition-all duration-300 ${step === 2 ? "bg-[#3F51F4]" : "bg-slate-200"}`}></div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41] tracking-tight">
                  {step === 1 ? "Create your free account" : "Complete your profile"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {step === 1
                    ? "Enter your email address to receive an instant verification code."
                    : `Enter the 6-digit code sent to ${email} and complete your details.`}
                </p>
              </div>

              {/* AnimatePresence for smooth multi-step transition */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  /* ========================================================= */
                  /* STEP 1: Email Input Form */
                  /* ========================================================= */
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSendOtp}
                    className="space-y-5 pt-1"
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus
                          autoComplete="email"
                          placeholder="name@example.com"
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                        <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-[#3F51F4] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                        We'll send a 6-digit verification code to confirm your email.
                      </p>
                    </div>

                    {/* Send Code Primary Action Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-extrabold text-white text-sm sm:text-base bg-gradient-to-r from-[#3F51F4] via-[#4D62F8] to-[#6A8EF0] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending verification code...</span>
                        </div>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Already have an account footer */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500 font-semibold">
                        Already have a customer account?{" "}
                        <Link
                          to="/login"
                          className="font-extrabold text-[#3F51F4] hover:underline"
                        >
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  /* ========================================================= */
                  /* STEP 2: OTP Verification & Full Profile Setup Form */
                  /* ========================================================= */
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleVerifyOtp}
                    className="space-y-4 pt-1"
                  >
                    {/* Security Notice & Edit Email Header */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-xl bg-[#3F51F4] text-white flex items-center justify-center shrink-0">
                          <KeyRound className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate text-xs">
                          <span className="font-extrabold text-[#1B2A41] block truncate">{email}</span>
                          <span className="text-[10px] text-slate-500 font-medium">OTP valid for 5 minutes</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-extrabold text-[#3F51F4] hover:underline shrink-0 px-2 py-1"
                      >
                        Change
                      </button>
                    </div>

                    {/* 6-Digit OTP Boxes */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Verification Code <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || resending}
                          className="text-xs font-bold text-[#3F51F4] hover:underline disabled:text-slate-400 disabled:no-underline transition flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                          {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                        </button>
                      </div>

                      <div className="flex justify-between gap-2">
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
                            onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value ? e : e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-black rounded-2xl border transition duration-200 outline-none ${
                              val
                                ? "bg-blue-50/60 border-[#3F51F4] text-[#1B2A41] ring-2 ring-[#3F51F4]/20"
                                : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Full Name Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          placeholder="e.g. John Doe"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#3F51F4] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                      </div>
                    </div>

                    {/* Mobile Number Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group flex items-center">
                        <div className="absolute left-3.5 flex items-center gap-1 text-slate-400 font-bold text-xs pointer-events-none border-r border-slate-200 pr-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setForm({ ...form, mobile: val });
                          }}
                          required
                          placeholder="9876543210"
                          className="w-full pl-18 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          required
                          autoComplete="new-password"
                          placeholder="••••••••••••"
                          className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#3F51F4] focus:ring-4 focus:ring-[#3F51F4]/15 outline-none transition duration-200"
                        />
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#3F51F4] absolute left-3.5 top-3.5 pointer-events-none transition-colors" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2">
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${hasMinLength ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 ${hasMinLength ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Min 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${hasUpper && hasLower ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 ${hasUpper && hasLower ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Upper & lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${hasNumber ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 ${hasNumber ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>At least 1 number</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${hasSymbol ? "text-emerald-600" : "text-slate-400"}`}>
                          <Check className={`w-3 h-3 ${hasSymbol ? "text-emerald-600" : "text-slate-300"}`} />
                          <span>Special symbol</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded-md border-slate-300 text-[#3F51F4] focus:ring-[#3F51F4] accent-[#3F51F4]"
                        />
                        <span className="text-xs text-slate-500 font-medium leading-tight">
                          I agree to the{" "}
                          <span className="text-[#3F51F4] font-bold hover:underline">Terms of Service</span>
                          {" "}and{" "}
                          <span className="text-[#3F51F4] font-bold hover:underline">Privacy Policy</span>.
                        </span>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading || !isPasswordValid || !agreeTerms}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm sm:text-base bg-gradient-to-r from-[#3F51F4] via-[#4D62F8] to-[#6A8EF0] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:opacity-95 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Creating your account...</span>
                          </div>
                        ) : (
                          <>
                            <span>Complete Registration</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-2.5 rounded-xl font-bold text-slate-500 text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Email
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;
