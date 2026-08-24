import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, MapPin, Store, CheckCircle2, AlertCircle, Save, KeyRound, Trash2, Building, Landmark, FileText, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const SellerProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    shopName: "",
    shopType: "",
    pan: "",
    aadhar: "",
    bankAccount: "",
    gst: "",
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
      const res = await axios.get("/seller/profile");
      setProfile(res.data.seller);
      setForm({
        name: res.data.seller?.name || "",
        email: res.data.seller?.email || "",
        mobile: res.data.seller?.mobile || "",
        shopName: res.data.seller?.shopName || "",
        shopType: res.data.seller?.shopType || "",
        pan: res.data.seller?.pan || "",
        aadhar: res.data.seller?.aadhar || "",
        bankAccount: res.data.seller?.bankAccount || "",
        gst: res.data.seller?.gst || "",
        address: res.data.seller?.address || {
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
      } else {
        toast.error("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Store Profile & Settings | ZyCart Merchant";
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
    if (!form.name || !form.mobile) {
      toast.error("Name and Mobile are required");
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.put("/seller/profile", form);
      toast.success("Profile updated successfully!");
      setProfile(res.data.seller);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This will deactivate your seller account.")) return;

    try {
      await axios.delete("/sellers/delete");
      logout();
      navigate("/");
      toast.success("Account deactivated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!profile) return null;

  const shopTypes = [
    "Electronics & Accessories",
    "Fashion and Beauty",
    "Home and Kitchen",
    "Health and Fitness",
    "Books",
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#10B981] to-[#059669] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Store className="w-8 h-8" />
          </div>
          
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900">{profile.shopName || profile.name}</h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                profile.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {profile.isApproved ? "Approved Merchant" : "Pending Verification"}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{profile.email} • {profile.mobile}</p>
          </div>

          <Link
            to="/changepassword"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-extrabold hover:text-emerald-600 hover:bg-slate-50 transition flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-4 h-4 text-emerald-600" /> Change Password
          </Link>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Form Panels */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Basic Merchant Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Merchant Owner Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="text"
                    value={form.email}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-200/60 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Shop Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Storefront Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Shop / Storefront Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={form.shopName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Primary Category / Shop Type
                  </label>
                  <select
                    name="shopType"
                    value={form.shopType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition cursor-pointer"
                  >
                    <option value="">Select Shop Category</option>
                    {shopTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Business & Legal Credentials */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Taxation &amp; Payout Account Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="pan"
                    value={form.pan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="aadhar"
                    value={form.aadhar}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={form.bankAccount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full sm:flex-1 py-4 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" /> {updating ? "Saving..." : "Save Store Changes"}
              </button>

              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition text-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Deactivate Account
              </button>
            </div>

          </div>

          {/* RIGHT: Status Sidebar Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Account Status
              </h2>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Approval State</span>
                  <p className={`font-black text-sm flex items-center gap-1.5 ${
                    profile.isApproved ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {profile.isApproved ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {profile.isApproved ? "Approved Merchant" : "Pending Admin Review"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Store Products</span>
                  <p className="font-black text-sm text-slate-900">{profile.totalProducts || 0} Listed</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Customer Orders</span>
                  <p className="font-black text-sm text-slate-900">{profile.totalOrders || 0} Fulfilled</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SellerProfile;
