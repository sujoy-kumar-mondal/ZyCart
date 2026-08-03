import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingCart, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    document.title = "User Details | ZyCart Admin";
  }, [userId]);

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

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">User not found</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-[#3F51F4]"
          onClick={() => navigate("/admin/users")}
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/admin/users")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1B2A41]">User Details</h1>
          <p className="text-gray-600">Manage user account information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Profile Information</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Full Name</p>
                <p className="text-[#1B2A41] font-semibold text-lg">{user?.name}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
                  user?.isBanned
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}>
                  {user?.isBanned ? "Banned" : "Active"}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </p>
                <p className="text-[#1B2A41] font-semibold">{user?.email}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Mobile
                </p>
                <p className="text-[#1B2A41] font-semibold">{user?.mobile || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {user?.addresses && user.addresses.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
              <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6" /> Addresses
              </h2>

              <div className="space-y-4">
                {user.addresses.map((addr, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-[#1B2A41] font-semibold">{addr.line1}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Postal Code: {addr.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Statistics */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" /> Account Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-[#3F51F4]">{orders?.length || 0}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Account Created</p>
                <p className="text-[#1B2A41] font-semibold text-sm">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          {orders && orders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
              <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Recent Orders</h2>

              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#3F51F4] transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#1B2A41]">Order #{order.parentOrderNumber}</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1B2A41]">₹{order.totalAmount?.toLocaleString()}</p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold mt-1 ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {orders.length > 5 && (
                <p className="text-center text-gray-600 text-sm mt-4">
                  +{orders.length - 5} more orders
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20 space-y-4">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Actions</h3>

            <button
              onClick={toggleBanStatus}
              disabled={actionLoading}
              className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 ${
                user?.isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionLoading ? "Processing..." : user?.isBanned ? "Unban User" : "Ban User"}
            </button>

            <button
              onClick={deleteUser}
              disabled={actionLoading}
              className="w-full px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition font-semibold disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Delete User"}
            </button>

            {/* Warning */}
            {user?.isBanned && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 mt-6">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-red-800 font-semibold text-sm">Account Banned</p>
                    <p className="text-red-700 text-xs mt-1">
                      This user cannot access their account or place orders
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="border-t pt-6 mt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">User ID</h4>
              <p className="text-gray-600 text-xs font-mono bg-gray-50 p-3 rounded break-all">
                {user?._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
