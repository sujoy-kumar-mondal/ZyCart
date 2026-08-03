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
      !form.shopName ||
      !form.shopType ||
      !form.pan ||
      !form.aadhar ||
      !form.bankAccount ||
      !form.gst
    ) {
      return toast.error("Please fill all required fields!");
    }

    const sellerIdToUse = sellerId || localStorage.getItem("sellerId") || user?.id;

    if (!sellerIdToUse) {
      return toast.error("Seller ID not found. Please register first.");
    }

    setLoading(true);

    const data = new FormData();
    data.append("sellerId", sellerIdToUse);
    data.append("shopName", form.shopName);
    data.append("shopType", form.shopType);
    data.append("pan", form.pan);
    data.append("aadhar", form.aadhar);
    data.append("bankAccount", form.bankAccount);
    data.append("gst", form.gst);

    if (form.license) {
      data.append("license", form.license);
    }

    try {
      const res = await axios.post("/auth/seller/submit-details", data);

      if (res.data.success) {
        toast.success("Application submitted! Wait for admin approval.");
        // Clear sellerId from localStorage
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
                  <label className="font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="tel"
                    value={registrationForm.mobile}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, mobile: e.target.value })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="9876543210"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={registrationForm.password}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, password: e.target.value })}
                    className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                    placeholder="••••••••"
                  />
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
                  <label className="font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
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
              <label className="font-medium text-gray-700">Shop Name</label>
              <input
                type="text"
                name="shopName"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Your Shop Name"
              />
            </div>

            {/* Shop Type */}
            <div>
              <label className="font-medium text-gray-700">Shop Type</label>
              <select
                name="shopType"
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
                <label className="font-medium text-gray-700">PAN</label>
                <input
                  type="text"
                  name="pan"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                  value={form.aadhar}
                  onChange={handleChange}
                  placeholder="1234 5678 9012"
                />
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label className="font-medium text-gray-700">Bank Account Number</label>
              <input
                type="text"
                name="bankAccount"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.bankAccount}
                onChange={handleChange}
                placeholder="Enter your bank account"
              />
            </div>

            {/* GST */}
            <div>
              <label className="font-medium text-gray-700">GST Number</label>
              <input
                type="text"
                name="gst"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 focus:border-indigo-600 outline-none transition"
                value={form.gst}
                onChange={handleChange}
                placeholder="GST Number"
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
