import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Phone, MapPin, Store, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const SellerProfile = () => {
  const { logout, user } = useAuth();
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

  // Fetch Profile
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
    fetchProfile();
    document.title = "Seller Profile | ZyCart";
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
      const res = await axios.put("/seller/profile", form);
      toast.success("Profile updated successfully!");
      setProfile(res.data.seller);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!");
    } finally {
      setUpdating(false);
    }
  };

  // Delete Account
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

  const shopTypes = [
    "Electronics & Accessories",
    "Fashion and Beauty",
    "Home and Kitchen",
    "Health and Fitness",
    "Books",
  ];

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT: Profile Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <User className="w-6 h-6" /> Basic Information
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

          {/* Shop Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <Store className="w-6 h-6" /> Shop Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Shop Name */}
              <div className="md:col-span-2">
                <label className="font-medium text-[#1B2A41]">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              {/* Shop Type */}
              <div className="md:col-span-2">
                <label className="font-medium text-[#1B2A41]">Shop Type</label>
                <select
                  name="shopType"
                  value={form.shopType}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                >
                  <option value="">Select Shop Type</option>
                  {shopTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Business & Legal Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">
              Business & Legal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* PAN */}
              <div>
                <label className="font-medium text-[#1B2A41]">PAN</label>
                <input
                  type="text"
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              {/* Aadhar */}
              <div>
                <label className="font-medium text-[#1B2A41]">Aadhar</label>
                <input
                  type="text"
                  name="aadhar"
                  value={form.aadhar}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              {/* GST */}
              <div>
                <label className="font-medium text-[#1B2A41]">GST</label>
                <input
                  type="text"
                  name="gst"
                  value={form.gst}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="font-medium text-[#1B2A41]">Bank Account</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 rounded-xl border border-[#8FD6F6]/40 bg-[#F7FBFF] text-[#1B2A41] focus:outline-none focus:ring-2 focus:ring-[#6A8EF0] transition"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Business Address
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

            <button
              onClick={handleDelete}
              className="flex-1 py-3 rounded-xl text-white font-semibold bg-red-500 hover:bg-red-600 transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* RIGHT: Status Card */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Account Status</h3>

            <div className="space-y-4">
              {/* Approval Status */}
              <div className="flex items-start gap-3">
                {profile?.isApproved ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-700">Approved</p>
                      <p className="text-sm text-gray-600">
                        {profile?.approvalDate ? `Since ${new Date(profile.approvalDate).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-orange-700">Pending Approval</p>
                      <p className="text-sm text-gray-600">Admin review in progress</p>
                    </div>
                  </>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-start gap-3 pt-4 border-t">
                {profile?.isActive ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-700">Active</p>
                      <p className="text-sm text-gray-600">Your account is active</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-red-700">Inactive</p>
                      <p className="text-sm text-gray-600">Your account is deactivated</p>
                    </div>
                  </>
                )}
              </div>

              {/* Banned Status */}
              {profile?.isBanned && (
                <div className="flex items-start gap-3 pt-4 border-t">
                  <>
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-red-700">Banned</p>
                      <p className="text-sm text-gray-600">
                        {profile?.rejectionReason || "Your account has been banned"}
                      </p>
                    </div>
                  </>
                </div>
              )}

              {/* Stats */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Products:</span>
                  <span className="font-semibold text-[#1B2A41]">{profile?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-semibold text-[#1B2A41]">{profile?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-semibold text-[#1B2A41]">{profile?.rating || 0}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import User icon from lucide-react
const User = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

export default SellerProfile;
