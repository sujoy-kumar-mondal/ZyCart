import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import {
  Eye,
  User,
  Ban,
  Trash2,
  Search,
  CheckCircle2,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  // In-App Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "", // 'ban', 'unban', 'delete'
    user: null,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error("Failed to load user directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanUser = async (user) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(`/admin/users/ban/${user._id}`);
      toast.success(res.data.message || `Customer '${user.name || user.email}' banned successfully!`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBanned: true } : u))
      );
      setConfirmModal({ open: false, type: "", user: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to ban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanUser = async (user) => {
    try {
      setActionLoading(true);
      const res = await axios.patch(`/admin/users/unban/${user._id}`);
      toast.success(res.data.message || `Customer '${user.name || user.email}' unbanned successfully!`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBanned: false } : u))
      );
      setConfirmModal({ open: false, type: "", user: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unban user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      setActionLoading(true);
      const res = await axios.delete(`/admin/users/${user._id}`);
      toast.success(res.data.message || `Customer account deleted successfully!`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setConfirmModal({ open: false, type: "", user: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Directory | ZyCart Admin";
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => !u.isBanned).length;
    const banned = users.filter((u) => u.isBanned).length;
    const verified = users.filter((u) => u.mobile).length;
    return { total, active, banned, verified };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.mobile || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !u.isBanned) ||
        (statusFilter === "banned" && u.isBanned);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

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
        <div className="bg-gradient-to-r from-black via-slate-900 to-[#BE123C] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Users className="w-3.5 h-3.5 text-rose-400" /> Platform Identity Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Customer Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Inspect shopper profiles, audit registration details, manage account permissions, and enforce safety bans.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={fetchUsers}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-rose-600" /> Refresh Users
            </button>
          </div>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
              <Users className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Registered user profiles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active &amp; Good</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.active}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Unrestricted access</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Restricted / Banned</span>
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-600">{stats.banned}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Banned for policy</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Phone Verified</span>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-600">{stats.verified}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Provided contact number</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search user name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-rose-500/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2 px-3 focus:ring-2 focus:ring-rose-500/40 outline-none cursor-pointer"
            >
              <option value="all">All Accounts ({users.length})</option>
              <option value="active">Active Accounts</option>
              <option value="banned">Banned Accounts</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                <User className="w-8 h-8" />
              </div>
              <p className="text-lg font-black text-slate-900">No customer accounts found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Try modifying your search query or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 whitespace-nowrap">Email Address</th>
                    <th className="px-6 py-4 whitespace-nowrap">Mobile Phone</th>
                    <th className="px-6 py-4 whitespace-nowrap">Account Status</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F87171] to-[#E11D48] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <span className="font-extrabold text-slate-900">{u.name || "Customer"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                        {u.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">
                        {u.mobile || "N/A"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${
                          u.isBanned ? "bg-red-100 text-red-800 border border-red-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>

                          {!u.isBanned ? (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: "ban", user: u })}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmModal({ open: true, type: "unban", user: u })}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                            >
                              Unban
                            </button>
                          )}

                          <button
                            onClick={() => setConfirmModal({ open: true, type: "delete", user: u })}
                            className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs"
                          >
                            Delete
                          </button>
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

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  confirmModal.type === "delete" || confirmModal.type === "ban"
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                  {confirmModal.type === "delete" ? (
                    <Trash2 className="w-5 h-5" />
                  ) : confirmModal.type === "ban" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {confirmModal.type === "delete"
                      ? "Delete Customer"
                      : confirmModal.type === "ban"
                      ? "Ban Customer Account"
                      : "Unban Customer Account"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{confirmModal.user.name || confirmModal.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal({ open: false, type: "", user: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {confirmModal.type === "delete"
                ? "Are you sure you want to permanently delete this customer account? All associated profile data will be permanently removed."
                : confirmModal.type === "ban"
                ? "Are you sure you want to ban this customer? They will be locked out from signing in and placing orders."
                : "Are you sure you want to unban this customer? Their access to sign in and place orders will be immediately restored."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, type: "", user: null })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => {
                  if (confirmModal.type === "ban") handleBanUser(confirmModal.user);
                  else if (confirmModal.type === "unban") handleUnbanUser(confirmModal.user);
                  else if (confirmModal.type === "delete") handleDeleteUser(confirmModal.user);
                }}
                className={`px-5 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer ${
                  confirmModal.type === "delete" || confirmModal.type === "ban"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : confirmModal.type === "delete"
                  ? "Confirm Delete"
                  : confirmModal.type === "ban"
                  ? "Confirm Ban"
                  : "Confirm Unban"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
