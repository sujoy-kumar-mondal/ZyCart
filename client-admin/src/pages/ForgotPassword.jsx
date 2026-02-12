import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState({});

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  

  useEffect(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    setEmail(storedUser.email)
  } catch (error) {
  }
}, []);

  // ------------------------------
  // Send OTP
  // ------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required!");
    if (!email.includes('@')) return toast.error("Please Enter valid email!");

    setLoading(true);

    try {
      const res = await axios.post("/auth/send-reset-otp", { email });

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
  // Verify OTP + Reset
  // ------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || !form.password || !form.confirmPassword) {
      return toast.error("Please fill all fields");
    }
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/verify-reset-otp", {
        email,
        otp,
        ...form,
      });

      if (res.data.success) {
        toast.success("Password reset successful!");
        navigate("/admin/dashboard");
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
          readOnly={!!user}
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
  // Step 2 UI (OTP + Password)
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
        <label className="font-medium text-[#1B2A41]">Password</label>
        <input
          type="password"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="font-medium text-[#1B2A41]">Confirm Password</label>
        <input
          type="password"
          className="
            w-full mt-2 px-4 py-3 rounded-xl
            border border-[#8FD6F6]/40 bg-[#F7FBFF]
            text-[#1B2A41] placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
            transition
          "
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
        {loading ? "Verifying..." : "Change Password"}
      </motion.button>
    </motion.form>
  );

  useEffect(() => {
    document.title = "Forgot Password | ZyCart";
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
          Forgot Password
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 ? Step1 : Step2}
        </AnimatePresence>

        {!user && (
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#3F51F4] hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>

    </div>
  );
};

export default ForgotPassword;
