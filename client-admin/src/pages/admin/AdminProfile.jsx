import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, MapPin, ShieldCheck, CheckCircle2, Save, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
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
      const res = await axios.get("/admin/profile");
      setProfile(res.data.admin);
      setForm({
        name: res.data.admin?.name || "",
        email: res.data.admin?.email || "",
        mobile: res.data.admin?.mobile || "",
        address: res.data.admin?.address || {
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
    fetchProfile();
    document.title = "Admin Account Profile | ZyCart Admin";
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
      const res = await axios.put("/admin/profile", form);
      toast.success("Profile updated successfully!");
      setProfile(res.data.admin);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!");
    } finally {
      setUpdating(false);
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

  const isSuperAdmin = profile.role === "super_admin";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-[#1B2A41]">{profile.name}</h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                isSuperAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {isSuperAdmin ? "Super Admin" : "Sub-Admin"}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{profile.email} • {profile.mobile}</p>
          </div>

          <Link
            to="/changepassword"
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-50 transition flex items-center gap-1.5 shrink-0"
          >
            <KeyRound className="w-4 h-4 text-[#3F51F4]" /> Change Password
          </Link>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Form Panels */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Personal Admin Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Admin Personal Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Residential / Office Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Address Line 1</label>
                  <input
                    type="text"
                    name="line1"
                    value={form.address.line1}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">State</label>
                    <input
                      type="text"
                      name="state"
                      value={form.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.address.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-sm bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {updating ? "Saving Changes..." : "Save Admin Profile"}
            </button>

          </div>

          {/* RIGHT: Permissions Matrix Sidebar */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Assigned Operational Privileges
              </h2>

              <div className="space-y-2 text-xs font-bold text-slate-700">
                {isSuperAdmin ? (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-purple-900 space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600">Full System Control</span>
                    <p className="font-extrabold text-xs">As Super Admin, you have unrestricted access to all operations.</p>
                  </div>
                ) : profile.permissions && profile.permissions.length > 0 ? (
                  profile.permissions.map((perm) => (
                    <div key={perm} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="capitalize">{perm.replace(/_/g, " ")}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 font-semibold text-xs">No permissions assigned.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminProfile;
