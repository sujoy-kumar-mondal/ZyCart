import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsProvider";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const ForgotPassword = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const brandName = settings?.platformName || "ZyCart";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRefs = useRef([]);

  useEffect(() => {
    document.title = `Forgot Password | ${brandName}`;
  }, [brandName]);

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

  // Password rules
  const pwd = form.password;
  const rules = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const isAllRulesMet = Object.values(rules).every(Boolean);
  const isMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  // ----------------------------------------------------
  // Step 1: Send Reset OTP
  // ----------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return toast.error("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/user/send-reset-otp", { email });
      if (res.data.success) {
        toast.success("Verification OTP sent to your email!");
        setStep(2);
        setResendCooldown(60);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Resend OTP
  // ----------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      const res = await axios.post("/auth/user/send-reset-otp", { email });
      if (res.data.success) {
        toast.success("A fresh OTP code has been sent!");
        setResendCooldown(60);
        setOtpValues(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // ----------------------------------------------------
  // Step 2: OTP Input Handling
  // ----------------------------------------------------
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
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
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtpValues(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // ----------------------------------------------------
  // Step 2: Verify OTP and Reset Password
  // ----------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      return toast.error("Please enter the complete 6-digit OTP code.");
    }

    if (!form.password || !form.confirmPassword) {
      return toast.error("Please fill in all password fields.");
    }

    if (!isAllRulesMet) {
      return toast.error("New password does not meet all security requirements.");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    setLoading(true);
    try {
      const res = await axios.post("/auth/user/verify-reset-otp", {
        email,
        otp,
        password: form.password,
      });

      if (res.data.success) {
        toast.success("Password reset successful! Please log in.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-slate-100 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-[#3F51F4] selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Background Animated Ambient Lights & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3F51F4_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-[#3F51F4]/25 to-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Main Dual-Column Container */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* LEFT SIDE: Security Overview & Brand Highlights */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#121929] via-[#0F172A] to-[#1E1B4B] p-8 sm:p-10 flex-col justify-between relative border-r border-slate-800/70 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
              </Link>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#8FD6F6]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Account Recovery
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Reset & Recover <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A8EF0] via-[#8FD6F6] to-cyan-300">
                    Your Access Safely
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  We use an encrypted 2-step email verification protocol to ensure only you can reset your customer account credentials.
                </p>
              </div>

              {/* Step Flow Preview */}
              <div className="space-y-3 pt-2">
                <div className={`p-3.5 rounded-2xl border transition ${step === 1 ? "bg-blue-500/15 border-blue-500/40 text-white" : "bg-slate-800/40 border-slate-700/40 text-slate-400"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-[#3F51F4] text-white" : "bg-slate-700 text-slate-300"}`}>
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Identify Your Email</h4>
                      <p className="text-[11px] text-slate-400">Receive a secure 6-digit one-time code.</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border transition ${step === 2 ? "bg-blue-500/15 border-blue-500/40 text-white" : "bg-slate-800/40 border-slate-700/40 text-slate-400"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-[#3F51F4] text-white" : "bg-slate-700 text-slate-300"}`}>
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">Verify & Set New Password</h4>
                      <p className="text-[11px] text-slate-400">Validate OTP and establish strong credentials.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help / Support Link */}
            <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>Need help?</span>
              <Link to="/contact" className="font-semibold text-[#6A8EF0] hover:text-white transition">
                Contact Customer Support →
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            
            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Header */}
              <div className="space-y-1 text-center lg:text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6A8EF0] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    Step {step} of 2
                  </span>
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Change email
                    </button>
                  )}
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2.5 pt-1">
                  <KeyRound className="w-6 h-6 text-[#6A8EF0]" />
                  {step === 1 ? "Forgot Password" : "Reset Password"}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {step === 1
                    ? "Enter your registered email address to receive a password reset code."
                    : `Enter the 6-digit OTP sent to ${email} and choose a new password.`}
                </p>
              </div>

              {/* STEP 1: Email Form */}
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Registered Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51F4] focus:border-transparent transition"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:from-[#5C72FF] hover:to-[#2F3EE0] text-white text-sm font-black shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Recovery Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white transition">
                      Remembered your password? <span className="text-[#6A8EF0]">Sign In</span>
                    </Link>
                  </div>
                </motion.form>
              ) : (
                /* STEP 2: OTP + New Password Form */
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-4"
                >
                  {/* 6-Digit OTP Inputs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Enter 6-Digit Verification Code</label>
                    <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                      {otpValues.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-black bg-slate-800/80 border border-slate-700/80 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#3F51F4] focus:border-[#3F51F4] transition shadow-inner"
                          required
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">Didn't receive the code?</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || resending}
                        className="text-[11px] font-bold text-[#6A8EF0] hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {resending ? "Sending..." : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Enter strong new password"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51F4] focus:border-transparent transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                      {form.confirmPassword && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${isMatch ? "text-emerald-400" : "text-rose-400"}`}>
                          {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {isMatch ? "Passwords match" : "Mismatch"}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/60 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition ${
                          form.confirmPassword
                            ? isMatch
                              ? "border-emerald-500/60 focus:ring-emerald-500"
                              : "border-rose-500/60 focus:ring-rose-500"
                            : "border-slate-700/80 focus:ring-[#3F51F4]"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Rules Meter */}
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2 text-xs"
                    >
                      <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Password Requirements:</p>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className={`flex items-center gap-1.5 ${rules.length ? "text-emerald-400" : "text-slate-500"}`}>
                          {rules.length ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1.5 ${rules.upper ? "text-emerald-400" : "text-slate-500"}`}>
                          {rules.upper ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
                          Uppercase letter (A-Z)
                        </div>
                        <div className={`flex items-center gap-1.5 ${rules.lower ? "text-emerald-400" : "text-slate-500"}`}>
                          {rules.lower ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
                          Lowercase letter (a-z)
                        </div>
                        <div className={`flex items-center gap-1.5 ${rules.number ? "text-emerald-400" : "text-slate-500"}`}>
                          {rules.number ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
                          Number (0-9)
                        </div>
                        <div className={`flex items-center gap-1.5 col-span-2 ${rules.special ? "text-emerald-400" : "text-slate-500"}`}>
                          {rules.special ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />}
                          Special character (!@#$%^&*)
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Reset Password Button */}
                  <button
                    type="submit"
                    disabled={loading || (form.password && !isAllRulesMet)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:from-[#5C72FF] hover:to-[#2F3EE0] text-white text-sm font-black shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reset Password &amp; Login</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;
