import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";
import { ShieldCheck, Users, Store, ShoppingBag, Truck, ArrowRight, Zap, Cpu } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "super_admin";
  const hasPerm = (perm) => isSuperAdmin || (user?.permissions && user.permissions.includes(perm));

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/dashboard");
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    document.title = "Executive Operations Dashboard | ZyCart Admin";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Executive Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Executive Command Center
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-blue-100 text-blue-800"
              }`}>
                {isSuperAdmin ? "Super Admin" : "Sub-Admin"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              Live platform metrics, seller verification requests, customer accounts, and global order audits.
            </p>
          </div>

          {isSuperAdmin && (
            <Link
              to="/admin/admins"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-md shadow-red-500/25 hover:opacity-95 transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Manage Sub-Admins
            </Link>
          )}
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Registered Users */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Users</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{data.users}</p>
            <p className="text-[10px] font-bold text-slate-400">Registered Customer Accounts</p>
          </div>

          {/* Active Sellers */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Sellers</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-600">{data.sellers}</p>
            <p className="text-[10px] font-bold text-slate-400">Onboarded Merchant Stores</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-red-600">{data.orders}</p>
            <p className="text-[10px] font-bold text-slate-400">Platform Purchases Fulfilled</p>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Deliveries</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-amber-600">{data.pendingDeliveries}</p>
            <p className="text-[10px] font-bold text-slate-400">In-Transit / Unfulfilled Packages</p>
          </div>

        </div>

        {/* Quick Operations Navigation */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Administrative Control Center</h2>
            <p className="text-xs text-slate-500 font-semibold">Select an operational module to review records or modify settings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPerm("manage_sellers") && (
              <Link
                to="/admin/sellers"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-red-50/50 hover:border-red-200 transition group space-y-2"
              >
                <Store className="w-6 h-6 text-red-600" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-red-600 transition">Manage Merchants</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">Verify GSTIN, PAN, and review store approval requests.</p>
              </Link>
            )}

            {hasPerm("manage_users") && (
              <Link
                to="/admin/users"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-red-50/50 hover:border-red-200 transition group space-y-2"
              >
                <Users className="w-6 h-6 text-red-600" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-red-600 transition">Manage Users</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">Review registered accounts, order count, and ban controls.</p>
              </Link>
            )}

            {hasPerm("manage_orders") && (
              <Link
                to="/admin/orders"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-rose-50/50 hover:border-rose-200 transition group space-y-2"
              >
                <ShoppingBag className="w-6 h-6 text-rose-600" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-600 transition">Global Order Audits</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">Audit platform commissions, multi-seller packages, and payouts.</p>
              </Link>
            )}

            {(isSuperAdmin || hasPerm("manage_admins")) && (
              <Link
                to="/admin/admins"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-rose-50/50 hover:border-rose-200 transition group space-y-2"
              >
                <ShieldCheck className="w-6 h-6 text-rose-600" />
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-rose-600 transition">Sub-Admin Roles</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">Configure sub-admin accounts and assign permission flags.</p>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
