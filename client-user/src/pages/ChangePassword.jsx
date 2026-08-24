import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Check,
  X,
  UserCheck,
} from "lucide-react";

const ChangePassword = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const brandName = settings?.platformName || "ZyCart";

  const [form, setForm] = useState({
    password: "",
    nPassword: "",
    cPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = `Change Password | ${brandName}`;
    if (!user) {
      toast.error("Please login to access change password");
      navigate("/login");
    }
  }, [user, navigate, brandName]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Password Validation Rules
  const pwd = form.nPassword;
  const rules = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const isAllRulesMet = Object.values(rules).every(Boolean);
  const isMatch = form.nPassword && form.cPassword && form.nPassword === form.cPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password || !form.nPassword || !form.cPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (!isAllRulesMet) {
      toast.error("New password does not meet all security requirements");
      return;
    }

    if (form.nPassword !== form.cPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (form.password === form.nPassword) {
      toast.error("New password must be different from your current password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/user/change-password", {
        password: form.password,
        nPassword: form.nPassword,
        cPassword: form.cPassword,
      });

      if (res.data.success) {
        toast.success("Account password updated successfully!");
        setForm({ password: "", nPassword: "", cPassword: "" });
        navigate("/profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
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
          
          {/* LEFT SIDE: Security Overview & Helpful Tips */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#121929] via-[#0F172A] to-[#1E1B4B] p-8 sm:p-10 flex-col justify-between relative border-r border-slate-800/70 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Profile
              </Link>

              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#8FD6F6]">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Account Security Center
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Protect Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A8EF0] via-[#8FD6F6] to-cyan-300">
                    Shopping Credentials
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Regularly updating your password safeguards your personal payment info, shipping addresses, and purchase history.
                </p>
              </div>

              {/* Security Guidelines */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#6A8EF0] flex items-center justify-center shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Unique Combination</h4>
                    <p className="text-[11px] text-slate-400">Use a password you do not use on any other online platform.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Two-Factor Protected</h4>
                    <p className="text-[11px] text-slate-400">Your account is additionally protected by 2FA Email OTPs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Logged-in User Chip */}
            <div className="relative z-10 pt-6 border-t border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-white font-black text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Customer"}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Password Change Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            
            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Header */}
              <div className="space-y-1 text-center lg:text-left">
                <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-[#8FD6F6] mb-2">
                  <Shield className="w-3.5 h-3.5" /> Security
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2.5">
                  <KeyRound className="w-6 h-6 text-[#6A8EF0]" /> Change Password
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Enter your current password and choose a strong new one.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Current Password</span>
                    <Link to="/resetpassword" className="text-[11px] font-semibold text-[#6A8EF0] hover:text-blue-300 transition">
                      Forgot Password?
                    </Link>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showCurrent ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51F4] focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      type={showNew ? "text" : "password"}
                      name="nPassword"
                      value={form.nPassword}
                      onChange={handleChange}
                      placeholder="Enter strong new password"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F51F4] focus:border-transparent transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                    {form.cPassword && (
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
                      type={showConfirm ? "text" : "password"}
                      name="cPassword"
                      value={form.cPassword}
                      onChange={handleChange}
                      placeholder="Re-type new password"
                      className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/60 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition ${
                        form.cPassword
                          ? isMatch
                            ? "border-emerald-500/60 focus:ring-emerald-500"
                            : "border-rose-500/60 focus:ring-rose-500"
                          : "border-slate-700/80 focus:ring-[#3F51F4]"
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Password Strength Requirements Checklist */}
                {form.nPassword && (
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (form.nPassword && !isAllRulesMet)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:from-[#5C72FF] hover:to-[#2F3EE0] text-white text-sm font-black shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ChangePassword;
