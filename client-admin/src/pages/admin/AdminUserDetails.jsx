import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingCart, AlertCircle, User, ShieldAlert, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminUserDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    document.title = `Customer Details | ${brandName} Admin`;
  }, [userId, brandName]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/users/${userId}`);
      setUser(res.data.user);
      setOrders(res.data.user.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBanStatus = async () => {
    try {
      setActionLoading(true);
      const endpoint = user.isBanned ? `/admin/users/unban/${userId}` : `/admin/users/ban/${userId}`;
      await axios.patch(endpoint);
      toast.success(user.isBanned ? "User unbanned successfully!" : "User banned successfully!");
      fetchUserDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      setActionLoading(true);
      await axios.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully!");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
                  {user.name}
                </h1>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  user.isBanned ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {user.isBanned ? "Account Banned" : "Active Customer"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Customer ID: <span className="font-mono text-slate-700">{user._id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Customer Profile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Customer Account Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</span>
                  <p className="font-black text-sm text-slate-900">{user.name || "Customer"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Account Joined</span>
                  <p className="font-black text-sm text-slate-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</span>
                  <p className="font-black text-sm text-slate-900">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Mobile Phone</span>
                  <p className="font-black text-sm text-slate-900">{user.mobile || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Saved Addresses */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                  Saved Shipping Addresses ({user.addresses.length})
                </h2>

                <div className="space-y-3">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700 space-y-0.5">
                      <p className="font-black text-slate-900">{addr.line1}</p>
                      <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders History */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Customer Order History ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400 py-4 text-center">No purchases recorded for this customer yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="font-black text-slate-900">Order #{order.parentOrderNumber}</p>
                        <p className="text-[10px] text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-slate-900">{currency}{order.totalAmount?.toLocaleString()}</p>
                        <span className="text-[10px] font-black uppercase text-[#3F51F4]">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Account Controls
              </h2>

              <div className="space-y-3">
                <button
                  onClick={toggleBanStatus}
                  disabled={actionLoading}
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition disabled:opacity-50 ${
                    user.isBanned
                      ? "bg-slate-800 hover:bg-slate-900 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {actionLoading ? "Processing..." : user.isBanned ? "Unban Customer Account" : "Ban Customer Account"}
                </button>

                <button
                  onClick={deleteUser}
                  disabled={actionLoading}
                  className="w-full py-4 rounded-2xl font-extrabold text-xs text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete Customer Account"}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminUserDetails;
