import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider.jsx";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const SellerApply = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [step, setStep] = useState(1); // Step 1: Register (if needed), Step 2: Seller Details
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sellerId, setSellerId] = useState(null); // Store sellerId from registration

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
    document.title = "Become a Seller | ZyCart";
    // If user is already authenticated, skip to seller details step
    if (user) {
      setStep(2);
    }
    
  }, [user]);

  // ================== REGISTRATION HANDLERS ==================

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

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

  // REGISTER USER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !otp || !registrationForm.name || !registrationForm.mobile || !registrationForm.password) {
      return toast.error("Please fill all required fields!");
    }

    if (!/^[0-9]{10}$/.test(registrationForm.mobile.trim())) {
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
        
        toast.success("Registration successful! Proceed to seller details.");
        setStep(2);
        setOtpSent(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  // ================== SELLER APPLICATION HANDLERS ==================

  // HANDLE INPUT CHANGE FOR SELLER FORM
  const handleChange = (e) => {
    if (e.target.name === "license") {
      setForm({ ...form, license: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // SUBMIT SELLER APPLICATION
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

    // Format validations
    const cleanPan = form.pan.trim().toUpperCase();
    const cleanAadhar = form.aadhar.replace(/\s+/g, "");
    const cleanBank = form.bankAccount.trim();
    const cleanGst = form.gst.trim().toUpperCase();

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      return toast.error("Invalid PAN format! (Must be 10 characters e.g. ABCDE1234F)");
    }

    if (!/^\d{12}$/.test(cleanAadhar)) {
      return toast.error("Invalid Aadhaar number! (Must be 12 digits)");
    }

    if (!/^\d{9,18}$/.test(cleanBank)) {
      return toast.error("Invalid Bank Account number! (Must be 9 to 18 digits)");
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
      return toast.error("Invalid GST number format! (15 characters e.g. 22AAAAA0000A1Z5)");
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
        toast.success("Application submitted! Wait for admin approval.");
        localStorage.removeItem("sellerId");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 max-w-screen-2xl container mx-auto px-4 md:px-14 bg-linear-to-br from-[#F0F4F8] via-[#E8F1F8] to-[#E0F0F8]">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto p-10 rounded-2xl shadow-xl bg-white border border-gray-200"
      >
        <h1 className="text-4xl font-extrabold text-center mb-2 text-[#1B2A41]">
          Become a Seller
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {step === 1 ? "Create your account" : "Tell us about your shop"}
        </p>

        {/* STEP 1: REGISTRATION (if user not authenticated) */}
        {step === 1 ? (
          <form className="space-y-6">
            {!otpSent ? (
              <>
                {/* Email */}
                <div>
                  <label className="font-medium text-gray-700">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="font-medium text-gray-700">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="font-medium text-gray-700">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={registrationForm.mobile}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="9876543210"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="font-medium text-gray-700">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={registrationForm.password}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, password: e.target.value })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min 8 characters including uppercase, lowercase, number & special symbol</p>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 text-lg font-semibold text-white rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-center mb-4">
                  Enter the OTP sent to <strong>{email}</strong>
                </p>

                {/* OTP */}
                <div>
                  <label className="font-medium text-gray-700">
                    Enter OTP <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-3 text-lg font-semibold rounded-xl border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="flex-1 py-3 text-lg font-semibold text-white rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </>
            )}

            {!otpSent && (
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
                  Login here
                </Link>
              </p>
            )}
          </form>
        ) : (
          // STEP 2: SELLER APPLICATION DETAILS
          <form onSubmit={handleSubmitApplication} className="space-y-6">

            {/* Shop Name */}
            <div>
              <label className="font-medium text-gray-700">
                Shop Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                name="shopName"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Your Shop Name"
              />
            </div>

            {/* Shop Type */}
            <div>
              <label className="font-medium text-gray-700">
                Shop Type <span className="text-red-600">*</span>
              </label>
              <select
                name="shopType"
                required
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.shopType}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                <option value="Electronics & Accessories">Electronics & Accessories</option>
                <option value="Fashion and Beauty">Fashion and Beauty</option>
                <option value="Home and Kitchen">Home and Kitchen</option>
                <option value="Health and Fitness">Health and Fitness</option>
                <option value="Books">Books</option>
              </select>
            </div>

            {/* PAN & Aadhar */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">
                  PAN <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="pan"
                  maxLength={10}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition uppercase"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">
                  Aadhar Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="aadhar"
                  maxLength={14}
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                  value={form.aadhar}
                  onChange={handleChange}
                  placeholder="1234 5678 9012"
                />
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="font-medium text-gray-700">
                Bank Account Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                name="bankAccount"
                maxLength={18}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.bankAccount}
                onChange={handleChange}
                placeholder="Enter your bank account"
              />
            </div>

            {/* GST */}
            <div>
              <label className="font-medium text-gray-700">
                GST Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                name="gst"
                maxLength={15}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition uppercase"
                value={form.gst}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            {/* License Upload */}
            <div>
              <label className="font-medium text-gray-700">Upload Business License (Optional)</label>
              <input
                type="file"
                name="license"
                accept="image/*,.pdf"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold text-white rounded-xl bg-linear-to-r from-indigo-600 to-blue-600 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        )}
      </motion.div>

    </div>
  );
};

export default SellerApply;
