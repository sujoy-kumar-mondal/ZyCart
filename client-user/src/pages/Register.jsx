import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthProvider";

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

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // ------------------------------
  // Send OTP
  // ------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required!");
    if (!email.includes('@')) return toast.error("Please Enter valid email!");

    setLoading(true);

    try {
      const res = await axios.post("/auth/send-otp", { email });

      if (res.data.success) {
        toast.success("OTP sent to your email!");
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Verify OTP + Register
  // ------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || !form.name || !form.mobile || !form.password) {
      return toast.error("Please fill all fields");
    }

    const pwd = form.password;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      return toast.error("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special symbol!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/verify-otp", {
        email,
        otp,
        ...form,
      });

      if (res.data.success) {
        toast.success("Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Step 1 UI (Email)
  // ------------------------------
  const Step1 = (
    <motion.form
      key="step1"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      onSubmit={handleSendOtp}
      className="space-y-5"
    >
      <div>
        <label className="font-medium text-[#1B2A41]">Email</label>
        <input
          type="email"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-xl text-lg font-semibold text-white
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          hover:opacity-90 transition shadow-md cursor-pointer disabled:cursor-not-allowed
        "
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </motion.button>
    </motion.form>
  );

  // ------------------------------
  // Step 2 UI (OTP + Details)
  // ------------------------------
  const Step2 = (
    <motion.form
      key="step2"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      onSubmit={handleVerifyOtp}
      className="space-y-5"
    >
      <div>
        <label className="font-medium text-[#1B2A41]">OTP</label>
        <input
          type="text"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="font-medium text-[#1B2A41]">Full Name</label>
        <input
          type="text"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="font-medium text-[#1B2A41]">Mobile Number</label>
        <input
          type="text"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="font-medium text-[#1B2A41]">Password</label>
        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            className="
              w-full px-4 py-3 pr-12 rounded-xl
              border border-[#8FD6F6]/40 bg-[#F7FBFF]
              text-[#1B2A41] placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
              transition
            "
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
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
        <p className="text-xs text-gray-500 mt-1">Min 8 characters including uppercase, lowercase, number & symbol</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="
          w-full py-3 rounded-xl text-lg font-semibold text-white
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          hover:opacity-90 transition shadow-md cursor-pointer disabled:cursor-not-allowed
        "
      >
        {loading ? "Verifying..." : "Register"}
      </motion.button>
    </motion.form>
  );

  useEffect(() => {
    document.title = "Register | ZyCart";
  }, []);

  return (
    <div
      className="
        min-h-screen flex items-center max-w-screen-2xl container mx-auto px-4 md:px-14 justify-center
        bg-linear-to-br from-[#C3F2EC] via-[#8FD6F6] to-[#3F51F4]
        py-12
      "
    >

      <div
        className="
            w-full max-w-md p-10 bg-white rounded-2xl shadow-xl
            border border-[#8FD6F6]/40
          "
      >
        <h1
          className="
              text-3xl font-extrabold text-center mb-6
              text-[#1B2A41]
            "
        >
          Register
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 ? Step1 : Step2}
        </AnimatePresence>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#3F51F4] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

    </div>
  );
};

export default Register;
