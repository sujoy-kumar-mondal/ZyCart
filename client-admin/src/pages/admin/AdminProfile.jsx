import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, MapPin, Shield, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { logout, user } = useAuth();
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

  // Fetch Profile
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
    document.title = "Admin Profile | ZyCart";
  }, []);

  // Handle Form Change
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

  // Update Profile
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

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">Failed to load profile</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-blue-600"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT: Profile Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6" /> Admin Profile
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="font-medium text-[#1B2A41]">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="font-medium text-[#1B2A41] flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email (read-only)
                </label>
                <input
                  type="text"
                  value={form.email}
                  readOnly
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-200 border border-gray-300 text-gray-700"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="font-medium text-[#1B2A41] flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Mobile *
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Address
            </h2>

            <div className="space-y-4">
              {/* Address Line 1 */}
              <div>
                <label className="font-medium text-[#1B2A41]">Address Line 1</label>
                <input
                  type="text"
                  name="line1"
                  value={form.address.line1}
                  onChange={handleChange}
                  placeholder="Building, House No."
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="font-medium text-[#1B2A41]">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.address.city}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="font-medium text-[#1B2A41]">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.address.state}
                    onChange={handleChange}
                    className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div>
                <label className="font-medium text-[#1B2A41]">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.address.postalCode}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          {profile?.permissions && profile.permissions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
              <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6" /> Permissions
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {profile.permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-3 p-3 bg-[#F7FBFF] rounded-lg border border-[#8FD6F6]/40">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-[#1B2A41] capitalize">{perm.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="flex-1 py-3 rounded-xl text-white font-semibold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 disabled:opacity-60 transition"
            >
              {updating ? "Updating..." : "Update Profile"}
            </button>

            <Link
              to="/changepassword"
              className="flex-1 py-3 rounded-xl text-white font-semibold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 text-center transition"
            >
              Change Password
            </Link>
          </div>
        </div>

        {/* RIGHT: Status Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Account Status</h3>

            <div className="space-y-4">
              {/* Active Status */}
              <div className="flex items-start gap-3">
                {profile?.isActive ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-700">Active</p>
                      <p className="text-sm text-gray-600">Your admin account is active</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-red-700">Inactive</p>
                      <p className="text-sm text-gray-600">Your admin account is deactivated</p>
                    </div>
                  </>
                )}
              </div>

              {/* Join Date */}
              <div className="pt-4 border-t">
                <p className="text-gray-600 text-sm">Admin Since:</p>
                <p className="text-[#1B2A41] font-semibold">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>

              {/* Last Login */}
              {profile?.lastLogin && (
                <div className="pt-3">
                  <p className="text-gray-600 text-sm">Last Login:</p>
                  <p className="text-[#1B2A41] font-semibold">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
