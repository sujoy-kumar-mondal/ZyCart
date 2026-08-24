import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Mail, Phone, MapPin, KeyRound, Trash2, Save, ShieldCheck } from "lucide-react";

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

  const fetchProfile = async () => {
    try {
      setLoading(true);
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
    document.title = "My Profile — Account Settings | ZyCart";
    fetchProfile();
  }, []);

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

  const handleUpdate = async () => {
    try {
      await axios.put("/users/profile", form);
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed!");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone."))
      return;

    try {
      await axios.delete("/users/delete");
      logout();
      toast.success("Account deleted.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Account deletion failed!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-xl font-bold text-[#1B2A41]">Failed to load account profile</h2>
          <button
            className="w-full py-3 rounded-2xl bg-[#3F51F4] text-white font-extrabold text-sm"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    if (!profile.name) return "U";
    const parts = profile.name.trim().split(" ");
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            {getInitials()}
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-[#1B2A41]">{profile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                Customer
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{profile.email}</p>
          </div>

          <Link
            to="/changepassword"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 transition flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-4 h-4 text-[#3F51F4]" /> Change Password
          </Link>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-[#3F51F4]" />
            <h2 className="text-lg font-extrabold text-[#1B2A41]">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-slate-200/60 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-100 pt-4 pb-4">
            <MapPin className="w-5 h-5 text-[#3F51F4]" />
            <h2 className="text-lg font-extrabold text-[#1B2A41]">Shipping Address</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Address Line 1
              </label>
              <input
                type="text"
                name="line1"
                value={form.address.line1}
                onChange={handleChange}
                placeholder="House No, Street..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.address.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.address.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleUpdate}
              className="w-full sm:flex-1 py-3.5 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Updates
            </button>

            <button
              onClick={handleDelete}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition text-sm flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;
