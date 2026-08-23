import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import {
  Eye,
  ShieldAlert,
  CheckCircle2,
  Ban,
  Search,
  Store,
  RefreshCw,
  Clock,
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminSellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  // Modal State for Confirmations
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "", // 'ban', 'unban', 'approve'
    seller: null,
  });

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/sellers");
      setSellers(res.data.sellers || []);
    } catch (error) {
      toast.error("Failed to load seller directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApproveSeller = async (seller) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(`/admin/sellers/approve/${seller._id}`);
      toast.success(res.data.message || `Store '${seller.shopName || seller.name}' approved!`);
      setSellers((prev) =>
        prev.map((s) =>
          s._id === seller._id ? { ...s, isApproved: true, isBanned: false } : s
        )
      );
      setConfirmModal({ open: false, type: "", seller: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve seller.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanSeller = async (seller) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(`/admin/sellers/ban/${seller._id}`);
      toast.success(res.data.message || `Store '${seller.shopName || seller.name}' has been banned.`);
      setSellers((prev) =>
        prev.map((s) =>
          s._id === seller._id ? { ...s, isBanned: true, isApproved: false } : s
        )
      );
      setConfirmModal({ open: false, type: "", seller: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to ban seller.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanSeller = async (seller) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(`/admin/sellers/unban/${seller._id}`);
      toast.success(res.data.message || `Store '${seller.shopName || seller.name}' unbanned!`);
      setSellers((prev) =>
        prev.map((s) =>
          s._id === seller._id ? { ...s, isBanned: false, isApproved: true } : s
        )
      );
      setConfirmModal({ open: false, type: "", seller: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unban seller.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Merchant Directory | ZyCart Admin";
  }, []);

  const stats = useMemo(() => {
    const total = sellers.length;
    const approved = sellers.filter((s) => s.isApproved && !s.isBanned).length;
    const pending = sellers.filter((s) => !s.isApproved && !s.isBanned).length;
    const banned = sellers.filter((s) => s.isBanned).length;
    return { total, approved, pending, banned };
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      const matchesSearch =
        (s.shopName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && s.isApproved && !s.isBanned) ||
        (statusFilter === "pending" && !s.isApproved && !s.isBanned) ||
        (statusFilter === "banned" && s.isBanned);

      return matchesSearch && matchesStatus;
    });
  }, [sellers, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1B2A41] via-[#243B5A] to-[#3F51F4] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Store className="w-3.5 h-3.5 text-blue-300" /> Platform Merchant Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Merchant Directory &amp; Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Verify business credentials, approve onboarding merchants, audit storefronts, and manage operational permissions.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={fetchSellers}
              className="px-5 py-3 rounded-2xl bg-white text-[#1B2A41] font-black text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#3F51F4]" /> Refresh Merchants
            </button>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Merchants</span>
              <Store className="w-4 h-4 text-[#3F51F4]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Registered storefronts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Approved &amp; Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.approved}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Verified business partners</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Verification</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.pending}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Awaiting admin review</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Banned Stores</span>
              <Ban className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-600">{stats.banned}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Suspended listings</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search shop name, owner name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2 px-3 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none cursor-pointer"
            >
              <option value="all">All Merchants ({sellers.length})</option>
              <option value="approved">Approved &amp; Active</option>
              <option value="pending">Pending Approval</option>
              <option value="banned">Banned Stores</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {filteredSellers.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                <Store className="w-8 h-8" />
              </div>
              <p className="text-lg font-black text-[#1B2A41]">No merchant stores found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Try modifying your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 whitespace-nowrap">Shop / Storefront</th>
                    <th className="px-6 py-4 whitespace-nowrap">Owner Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Category</th>
                    <th className="px-6 py-4 whitespace-nowrap">Approval Status</th>
                    <th className="px-6 py-4 whitespace-nowrap">Products Listed</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {filteredSellers.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-extrabold text-sm flex items-center justify-center border border-purple-100 shrink-0">
                            {s.shopName ? s.shopName[0].toUpperCase() : "S"}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{s.shopName || "Unnamed Store"}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                        {s.name || "N/A"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">
                        {s.shopType || "General"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                          s.isBanned
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : s.isApproved
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {s.isBanned ? "Banned" : s.isApproved ? "Approved" : "Pending Verification"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900">
                        {s.totalProducts || 0}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/sellers/${s._id}`)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>

                          {!s.isApproved && !s.isBanned && (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: "approve", seller: s })}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              Approve
                            </button>
                          )}

                          {!s.isBanned ? (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: "ban", seller: s })}
                              className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: "unban", seller: s })}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              Unban
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Action Confirmation Modal */}
      {confirmModal.open && confirmModal.seller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  confirmModal.type === "ban"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                  {confirmModal.type === "ban" ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1B2A41]">
                    {confirmModal.type === "ban"
                      ? "Ban Merchant Store"
                      : confirmModal.type === "unban"
                      ? "Unban Merchant Store"
                      : "Approve Merchant Store"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Store: {confirmModal.seller.shopName || confirmModal.seller.name}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal({ open: false, type: "", seller: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {confirmModal.type === "ban"
                ? "Are you sure you want to ban this merchant store? All their active product listings will be hidden from customer search immediately."
                : confirmModal.type === "unban"
                ? "Are you sure you want to unban this merchant store? Their storefront and products will be restored to active status."
                : "Are you sure you want to approve this merchant account? They will gain full access to publish and sell products on ZyCart."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, type: "", seller: null })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirmModal.type === "ban") handleBanSeller(confirmModal.seller);
                  else if (confirmModal.type === "unban") handleUnbanSeller(confirmModal.seller);
                  else if (confirmModal.type === "approve") handleApproveSeller(confirmModal.seller);
                }}
                className={`px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer ${
                  confirmModal.type === "ban"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : confirmModal.type === "ban"
                  ? "Confirm Ban"
                  : confirmModal.type === "unban"
                  ? "Confirm Unban"
                  : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSellers;
