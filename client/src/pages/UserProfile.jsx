import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
  });

  // -----------------------------
  // Fetch Profile
  // -----------------------------
  const fetchProfile = async () => {
    try {
      const res = await axios.get("/users/profile");
      setProfile(res.data.user);
      setForm({
        name: res.data.user?.name || "",
        mobile: res.data.user?.mobile || "",
      });
    } catch (error) {
      console.error("Profile error:", error);

      if (error.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -----------------------------
  // Form change handler
  // -----------------------------
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // -----------------------------
  // Update profile
  // -----------------------------
  const handleUpdate = async () => {
    try {
      const res = await axios.put("/users/profile", form);
      alert("Profile updated!");
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed!");
    }
  };

  // -----------------------------
  // Delete user account
  // -----------------------------
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;

    try {
      await axios.delete("/users/delete");
      logout();
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed!");
    }
  };
  useEffect(() => {
    document.title = "Profile | ZyCart";
  }, []);

  // -----------------------------
  // Loading
  // -----------------------------
  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold text-red-500">
          Failed to load profile. Please login again.
        </h2>
        <button
          className="
            mt-4 px-6 py-2 rounded-lg text-white font-semibold
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          "
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div
      className="
        max-w-screen-2xl container mx-auto px-14
        py-16 flex justify-center
      "
    >
      <div
        className="
          w-full max-w-xl p-10 bg-white rounded-2xl shadow-xl
          border border-[#8FD6F6]/40 space-y-6
        "
      >
        <h1 className="text-3xl font-extrabold text-[#1B2A41]">
          My Profile
        </h1>

        <div className="space-y-5">

          {/* Email (read only) */}
          <div>
            <label className="font-medium text-[#1B2A41]">
              Email (read-only)
            </label>
            <input
              type="text"
              value={profile?.email || ""}
              readOnly
              className="
                w-full mt-2 px-4 py-3 rounded-xl
                bg-gray-200 border border-gray-300
                text-gray-700
              "
            />
          </div>

          {/* Name */}
          <div>
            <label className="font-medium text-[#1B2A41]">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="
                w-full mt-2 px-4 py-3 rounded-xl
                border border-[#8FD6F6]/40 bg-[#F7FBFF]
                text-[#1B2A41] placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                transition
              "
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="font-medium text-[#1B2A41]">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="
                w-full mt-2 px-4 py-3 rounded-xl
                border border-[#8FD6F6]/40 bg-[#F7FBFF]
                text-[#1B2A41] placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                transition
              "
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">

          <button
            onClick={handleUpdate}
            className="
              flex-1 py-3 rounded-xl text-white font-semibold
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              hover:opacity-90 transition
            "
          >
            Update Profile
          </button>

          <Link
            to={'/changepassword'}
            className="
              flex-1 py-3 rounded-xl text-white font-semibold
              bg-linear-to-r text-center from-[#6A8EF0] to-[#3F51F4]
              hover:opacity-90 transition
            "
          >
            Change Password
          </Link>

          <button
            onClick={handleDelete}
            className="
              flex-1 py-3 rounded-xl text-white font-semibold
              bg-red-500 hover:bg-red-600 transition
            "
          >
            Delete Account
          </button>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;
