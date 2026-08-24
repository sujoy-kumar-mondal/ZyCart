import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

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

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ password: "", nPassword: "", cPassword: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNPassword, setShowNPassword] = useState(false);
    const [showCPassword, setShowCPassword] = useState(false);

    useEffect(() => {
        document.title = "Change Password | ZyCart";
        if (!user) {
            toast.error("Please login to access change password");
            navigate("/login");
        }
    }, [user, navigate]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handlePassword = async (e) => {
        e.preventDefault();
        if (form.nPassword !== form.cPassword) {
            toast.error("Passwords do not match")
            return;
        }

        setLoading(true);

        if (!window.confirm("Are you sure you want to change your account password?"))
            return;

        try {
            const res = await axios.post("/auth/admin/change-password", { ...form })

            if (res.data.success) {
                toast.success("Password change successful!");
                navigate("/admin/dashboard");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Password Change failed!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="
        min-h-screen flex items-center max-w-screen-2xl container mx-auto px-4 md:px-14 justify-center
        bg-linear-to-br from-[#C3F2EC] via-[#8FD6F6] to-[#3F51F4]
        py-12
      "
            >

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="
            w-full max-w-md p-10 
            bg-white rounded-2xl shadow-xl 
            border border-[#8FD6F6]/40
          "
                >
                    {/* Title */}
                    <h1 className="text-3xl font-extrabold text-center text-[#1B2A41]">
                        Change Password
                    </h1>

                    {/* Form */}
                    <form onSubmit={handlePassword} className="space-y-6 mt-8">

                        {/* Current Password */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">Current Password</label>
                            <div className="relative mt-2">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    onChange={handleChange}
                                    value={form.password}
                                    required
                                    className="
                      w-full px-4 py-3 pr-12 rounded-xl
                      border border-[#8FD6F6]/40 
                      bg-[#F7FBFF] text-[#1B2A41]
                      placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                      transition
                    "
                                    placeholder="Enter your current password"
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
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">New Password</label>
                            <div className="relative mt-2">
                                <input
                                    type={showNPassword ? "text" : "password"}
                                    name="nPassword"
                                    onChange={handleChange}
                                    value={form.nPassword}
                                    required
                                    className="
                      w-full px-4 py-3 pr-12 rounded-xl
                      border border-[#8FD6F6]/40 
                      bg-[#F7FBFF] text-[#1B2A41]
                      placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                      transition
                    "
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#3F51F4] transition"
                                    aria-label={showNPassword ? "Hide password" : "Show password"}
                                >
                                    {showNPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">Confirm Password</label>
                            <div className="relative mt-2">
                                <input
                                    type={showCPassword ? "text" : "password"}
                                    name="cPassword"
                                    onChange={handleChange}
                                    value={form.cPassword}
                                    required
                                    className="
                      w-full px-4 py-3 pr-12 rounded-xl
                      border border-[#8FD6F6]/40 
                      bg-[#F7FBFF] text-[#1B2A41]
                      placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                      transition
                    "
                                    placeholder="Enter your confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#3F51F4] transition"
                                    aria-label={showCPassword ? "Hide password" : "Show password"}
                                >
                                    {showCPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Change Button */}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="
                w-full py-3 rounded-xl text-white font-semibold
                bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                hover:opacity-95 transition shadow-lg cursor-pointer disabled:cursor-not-allowed
              "
                        >
                            {loading ? "Changing in..." : "Change Password"}
                        </motion.button>
                    </form>

                    {/* Password Reset Link */}
                    <div className="flex justify-center">
                        <p className="text-center mt-6 text-gray-600">
                            <Link
                                to="/resetpassword"
                                className="font-semibold text-[#3F51F4] hover:underline"
                            >
                                Forgotten password?
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default ChangePassword;
