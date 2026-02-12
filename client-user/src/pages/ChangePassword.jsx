import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const ChangePassword = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ password: "", nPassword: "", cPassword: "" });
    const [loading, setLoading] = useState(false);

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
            const res = await axios.post("/auth/changepassword", { ...form })

            if (res.data.success) {
                toast.success("Password change successful!");
                navigate("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Password Change failed!");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        document.title = "Change Password | ZyCart";
    }, []);

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

                        {/* Current Passwword */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">Current Passwword</label>
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                value={form.password}
                                required
                                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 
                  bg-[#F7FBFF] text-[#1B2A41]
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
                                placeholder="Enter your current password"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">New Password</label>
                            <input
                                type="password"
                                name="nPassword"
                                onChange={handleChange}
                                value={form.nPassword}
                                required
                                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 
                  bg-[#F7FBFF] text-[#1B2A41]
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
                                placeholder="Enter your new password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="font-medium text-[#1B2A41]">Confirm Password</label>
                            <input
                                type="password"
                                name="cPassword"
                                onChange={handleChange}
                                value={form.cPassword}
                                required
                                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 
                  bg-[#F7FBFF] text-[#1B2A41]
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
                                placeholder="Enter your confirm password"
                            />
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

                    {/* Register Link */}
                    <div className=" flex">
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
