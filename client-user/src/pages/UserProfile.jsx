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
    address: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
    },
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
        address: res.data.user?.address || {
          line1: "",
          city: "",
          state: "",
          postalCode: "",
        },
      });
    } catch (error) {
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
  // Form change handler (handles both regular and address fields)
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (["line1", "city", "state", "postalCode"].includes(name)) {
      setForm({
        ...form,
        address: { ...form.address, [name]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
        max-w-screen-2xl container mx-auto px-4 md:px-14
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

          {/* ADDRESS SECTION */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A41] mb-4">
              Shipping Address
            </h3>

            {/* Address Line 1 */}
            <div className="mb-4">
              <label className="font-medium text-[#1B2A41]">
                Address Line 1
              </label>
              <input
                type="text"
                name="line1"
                value={form.address.line1}
                onChange={handleChange}
                placeholder="House No., Building Name"
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 bg-[#F7FBFF]
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* City */}
            <div className="mb-4">
              <label className="font-medium text-[#1B2A41]">City</label>
              <input
                type="text"
                name="city"
                value={form.address.city}
                onChange={handleChange}
                placeholder="City"
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 bg-[#F7FBFF]
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* State */}
            <div className="mb-4">
              <label className="font-medium text-[#1B2A41]">State</label>
              <input
                type="text"
                name="state"
                value={form.address.state}
                onChange={handleChange}
                placeholder="State"
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  border border-[#8FD6F6]/40 bg-[#F7FBFF]
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="font-medium text-[#1B2A41]">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={form.address.postalCode}
                onChange={handleChange}
                placeholder="123456"
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
