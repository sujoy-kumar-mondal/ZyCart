import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider.jsx";
import { useSettings } from "../../context/SettingsProvider.jsx";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Store, ShieldCheck, ArrowRight, Upload, Building, CreditCard, FileText, CheckCircle2, Sparkles } from "lucide-react";

const SellerApply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sellerId, setSellerId] = useState(null);

  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [form, setForm] = useState({
    shopName: "",
    shopType: "",
    pan: "",
    aadhar: "",
    bankAccount: "",
    gst: "",
    license: null,
  });
  
  useEffect(() => {
    document.title = "Apply as Merchant | ZyCart Central";
    if (user) {
      setStep(2);
    }
  }, [user]);

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (settings.requireGstin !== false && !form.gst) {
      return toast.error("GSTIN number is required!");
    }
    if (!email) return toast.error("Email is required!");
    if (!email.includes("@")) return toast.error("Please enter a valid email!");
    if (!registrationForm.name.trim()) return toast.error("Full Name is required!");
    
    if (!registrationForm.mobile || !/^[0-9]{10}$/.test(registrationForm.mobile.trim())) {
      return toast.error("Mobile number must be a valid 10-digit number!");
    }

    const pwd = registrationForm.password;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    if (!pwd || pwd.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return toast.error("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special symbol!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/seller/send-otp", { email });
      if (res.data.success) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !otp || !registrationForm.name || !registrationForm.mobile || !registrationForm.password) {
      return toast.error("Please fill all required fields!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/seller/verify-otp", {
        email,
        otp,
        name: registrationForm.name,
        mobile: registrationForm.mobile,
        password: registrationForm.password,
      });

      if (res.data.success) {
        setSellerId(res.data.sellerId);
        if (res.data.sellerId) {
          localStorage.setItem("sellerId", res.data.sellerId);
        }
        toast.success("Registration successful! Complete shop details.");
        setStep(2);
        setOtpSent(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "license") {
      setForm({ ...form, license: e.target.files[0] });
    } else if (name === "pan" || name === "gst") {
      setForm({ ...form, [name]: value.toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (
      !form.shopName.trim() ||
      !form.shopType.trim() ||
      !form.pan.trim() ||
      !form.aadhar.trim() ||
      !form.bankAccount.trim() ||
      !form.gst.trim()
    ) {
      return toast.error("Please fill all required fields!");
    }

    const cleanPan = form.pan.trim().toUpperCase();
    const cleanAadhar = form.aadhar.replace(/\s+/g, "");
    const cleanBank = form.bankAccount.trim();
    const cleanGst = form.gst.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return toast.error("Invalid PAN format! (e.g. ABCDE1234F)");
    }

    if (!/^\d{12}$/.test(cleanAadhar)) {
      return toast.error("Invalid Aadhaar number! (Must be 12 digits)");
    }

    if (!/^\d{9,18}$/.test(cleanBank)) {
      return toast.error("Invalid Bank Account number! (9 to 18 digits)");
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/i.test(cleanGst)) {
      return toast.error("Invalid GSTIN number format! (Must be 15 characters, e.g. 22ABCDE1234F1Z5)");
    }

    if (cleanPan && cleanGst.length >= 12 && cleanGst.slice(2, 12) !== cleanPan) {
      return toast.error("GSTIN characters 3 to 12 must match your PAN number!");
    }

    const sellerIdToUse = sellerId || localStorage.getItem("sellerId") || user?.id;

    if (!sellerIdToUse) {
      return toast.error("Seller ID not found. Please register first.");
    }

    setLoading(true);

    const data = new FormData();
    data.append("sellerId", sellerIdToUse);
    data.append("shopName", form.shopName.trim());
    data.append("shopType", form.shopType.trim());
    data.append("pan", cleanPan);
    data.append("aadhar", cleanAadhar);
    data.append("bankAccount", cleanBank);
    data.append("gst", cleanGst);

    if (form.license) {
      data.append("license", form.license);
    }

    try {
      const res = await axios.post("/auth/seller/submit-details", data);

      if (res.data.success) {
        toast.success("Application submitted! Admin review in progress.");
        localStorage.removeItem("sellerId");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Application submission failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-[#F8FAFC] to-indigo-50/60 py-12 px-4 flex items-center justify-center relative overflow-hidden">
      
      {/* Floating Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200/80 space-y-8 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-[#1B2A41]">
            Apply as ZyCart Merchant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            {step === 1 ? "Step 1: Create your merchant account credentials" : "Step 2: Submit shop credentials & GST details"}
          </p>
        </div>

        {/* Step 1: User Account Registration */}
        {step === 1 ? (
          <form className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    placeholder="Owner Full Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={registrationForm.mobile}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, mobile: e.target.value.replace(/\D/g, "") })}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={registrationForm.password}
                      onChange={(e) => setRegistrationForm({ ...registrationForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send Verification OTP"} <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Enter OTP sent to {email}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-center tracking-widest text-[#1B2A41] focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-2/3 py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md hover:opacity-95 transition text-sm"
                  >
                    {loading ? "Registering..." : "Verify OTP & Continue"}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* Step 2: Merchant Shop Application Details */
          <form onSubmit={handleSubmitApplication} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Shop / Brand Name *
              </label>
              <input
                type="text"
                required
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="e.g. Apex Electronics"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Primary Product Category *
              </label>
              <select
                name="shopType"
                required
                value={form.shopType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition cursor-pointer"
              >
                <option value="">Select Category</option>
                <option value="Electronics & Accessories">Electronics & Accessories</option>
                <option value="Fashion and Beauty">Fashion and Beauty</option>
                <option value="Home and Kitchen">Home and Kitchen</option>
                <option value="Health and Fitness">Health and Fitness</option>
                <option value="Books">Books</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  PAN Number *
                </label>
                <input
                  type="text"
                  required
                  name="pan"
                  maxLength={10}
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  required
                  name="aadhar"
                  maxLength={14}
                  value={form.aadhar}
                  onChange={handleChange}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  name="bankAccount"
                  maxLength={18}
                  value={form.bankAccount}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  GSTIN Number {settings.requireGstin !== false ? "*" : "(Optional)"}
                </label>
                <input
                  type="text"
                  required={settings.requireGstin !== false}
                  name="gst"
                  maxLength={15}
                  value={form.gst}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Business License PDF / Image (Optional)
              </label>
              <input
                type="file"
                name="license"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Merchant Application"}
            </button>
          </form>
        )}
      </motion.div>

    </div>
  );
};

export default SellerApply;
