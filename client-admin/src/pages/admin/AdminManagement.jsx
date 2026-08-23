import React, { useEffect, useState, useMemo } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { 
  ShieldCheck, 
  UserPlus, 
  Shield, 
  UserX, 
  UserCheck, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Calendar,
  Lock,
  Clock,
  Layers,
  Users,
  Store,
  ShoppingBag,
  Package,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";

const ALL_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users", icon: Users, desc: "View, ban, unban, delete customer accounts" },
  { id: "manage_sellers", label: "Manage Sellers", icon: Store, desc: "Approve, view, ban, unban seller accounts" },
  { id: "manage_orders", label: "Manage Orders", icon: ShoppingBag, desc: "View and update status of customer orders" },
  { id: "manage_products", label: "Manage Products", icon: Package, desc: "Moderate seller product listings" },
  { id: "manage_categories", label: "Manage Categories", icon: Layers, desc: "Edit categories and dynamic schemas" },
  { id: "manage_admins", label: "Manage Admins", icon: ShieldCheck, desc: "Create, edit, inspect, and delete admin accounts" },
  { id: "view_analytics", label: "View Analytics", icon: TrendingUp, desc: "Access dashboard statistics and reports" },
  { id: "system_settings", label: "System Settings", icon: Settings, desc: "Configure global system parameters" },
];

const AdminManagement = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [inspectingAdmin, setInspectingAdmin] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    admin: null,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "admin",
    permissions: ["manage_users", "manage_sellers", "manage_orders", "view_analytics"],
    isActive: true,
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/admins");
      setAdmins(res.data.admins || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    document.title = "Sub-Admin Roles & Permissions | ZyCart Admin";
  }, []);

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      mobile: "",
      role: "admin",
      permissions: ["manage_users", "manage_sellers", "manage_orders", "view_analytics"],
      isActive: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      mobile: admin.mobile || "",
      role: admin.role || "admin",
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false,
    });
    setShowEditModal(true);
  };

  const openInspectModal = (admin) => {
    setInspectingAdmin(admin);
    setShowInspectModal(true);
  };

  const handlePermissionToggle = (permId) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: ALL_PERMISSIONS.map((p) => p.id),
    }));
  };

  const handleClearPermissions = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.mobile) {
      toast.error("Name, email, password, and mobile number are required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile.trim())) {
      toast.error("Mobile number must be a valid 10-digit number.");
      return;
    }

    const pwd = formData.password;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      toast.error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/admin/admins", formData);
      toast.success(res.data.message || "Admin created successfully!");
      setShowAddModal(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setSubmitting(true);
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await axios.put(`/admin/admins/${selectedAdmin._id}`, payload);
      toast.success(res.data.message || "Admin updated successfully!");
      setShowEditModal(false);
      
      // Update inspecting admin if currently open
      if (inspectingAdmin?._id === selectedAdmin._id) {
        setInspectingAdmin((prev) => ({ ...prev, ...payload }));
      }
      
      setSelectedAdmin(null);
      fetchAdmins();
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeleteAdmin = async (admin) => {
    if (!admin) return;
    if (admin._id === currentUser?._id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.delete(`/admin/admins/${admin._id}`);
      toast.success(res.data.message || `Admin '${admin.name}' deleted successfully`);
      setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
      setDeleteModal({ open: false, admin: null });
      if (showInspectModal && inspectingAdmin?._id === admin._id) {
        setShowInspectModal(false);
        setInspectingAdmin(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    if (admin._id === currentUser?._id) {
      toast.error("You cannot deactivate your own admin account.");
      return;
    }

    try {
      const updatedStatus = !admin.isActive;
      await axios.put(`/admin/admins/${admin._id}`, { isActive: updatedStatus });
      toast.success(`Admin '${admin.name}' status updated to ${updatedStatus ? "Active" : "Inactive"}`);
      setAdmins((prev) =>
        prev.map((a) => (a._id === admin._id ? { ...a, isActive: updatedStatus } : a))
      );
      if (inspectingAdmin?._id === admin._id) {
        setInspectingAdmin((prev) => ({ ...prev, isActive: updatedStatus }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter((a) =>
      (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.mobile || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const superAdminCount = admins.filter((a) => a.role === "super_admin").length;
  const activeCount = admins.filter((a) => a.isActive).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner matching AdminProducts & AdminOrders */}
        <div className="bg-gradient-to-r from-[#1B2A41] via-[#243B5A] to-[#3F51F4] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" /> Platform Security &amp; Access Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sub-Admin Roles &amp; Permissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Create sub-administrator accounts, inspect granted capabilities, configure granular permission flags, and audit operational access.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={fetchAdmins}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={openAddModal}
              className="px-5 py-3 rounded-2xl bg-white text-[#1B2A41] font-black text-xs shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-[#3F51F4]" /> Add New Sub-Admin
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Administrators</span>
              <ShieldCheck className="w-4 h-4 text-[#3F51F4]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{admins.length}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Registered staff profiles</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Staff</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{activeCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Active operational accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Super Admins</span>
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-600">{superAdminCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Full root privileges</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Sub-Admins</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{admins.length - superAdminCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Role-based restricted staff</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search admin name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 whitespace-nowrap">Admin Member</th>
                  <th className="px-6 py-4 whitespace-nowrap">Email Address</th>
                  <th className="px-6 py-4 whitespace-nowrap">Contact Phone</th>
                  <th className="px-6 py-4 whitespace-nowrap">Role Type</th>
                  <th className="px-6 py-4 whitespace-nowrap">Account Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Granted Privileges</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {filteredAdmins.map((adm) => {
                  const isSelf = adm._id === currentUser?._id;
                  const isSuper = adm.role === "super_admin";

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0 ${
                            isSuper
                              ? "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20"
                              : "bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] shadow-md shadow-blue-500/20"
                          }`}>
                            {adm.name ? adm.name[0].toUpperCase() : "A"}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900">{adm.name}</span>
                            {isSelf && (
                              <span className="ml-2 text-[9px] font-black text-[#3F51F4] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                        {adm.email}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">
                        {adm.mobile || "N/A"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isSuper ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {isSuper ? "Super Admin" : "Sub-Admin"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(adm)}
                          disabled={isSelf}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                            adm.isActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
                          } disabled:opacity-50`}
                        >
                          {adm.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        {isSuper ? (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                            Full Privileges
                          </span>
                        ) : adm.permissions && adm.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            <span className="text-[10px] font-black px-2.5 py-0.5 bg-blue-50 text-[#3F51F4] rounded-full border border-blue-100">
                              {adm.permissions.length} Module{adm.permissions.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold text-[10px]">No permissions</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openInspectModal(adm)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>

                          <button
                            onClick={() => openEditModal(adm)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs transition cursor-pointer active:scale-95 shadow-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>

                          <button
                            onClick={() => setDeleteModal({ open: true, admin: adm })}
                            disabled={isSelf}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition disabled:opacity-30 cursor-pointer active:scale-95 shadow-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* INSPECT SUB-ADMIN MODAL */}
      {showInspectModal && inspectingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl border border-slate-200 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ${
                  inspectingAdmin.role === "super_admin"
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20"
                    : "bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] shadow-blue-500/20"
                }`}>
                  {inspectingAdmin.name ? inspectingAdmin.name[0].toUpperCase() : "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-black text-[#1B2A41]">{inspectingAdmin.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      inspectingAdmin.role === "super_admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {inspectingAdmin.role === "super_admin" ? "Super Admin" : "Sub-Admin"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">{inspectingAdmin.email} • {inspectingAdmin.mobile}</p>
                </div>
              </div>

              <button
                onClick={() => setShowInspectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Audit Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Account Status</span>
                <p className="font-extrabold text-slate-900">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                    inspectingAdmin.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {inspectingAdmin.isActive ? "Active Staff" : "Inactive / Suspended"}
                  </span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Last Login</span>
                <p className="font-extrabold text-slate-900">
                  {inspectingAdmin.lastLogin
                    ? new Date(inspectingAdmin.lastLogin).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                    : "Never logged in"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Account Created</span>
                <p className="font-extrabold text-slate-900">
                  {inspectingAdmin.createdAt
                    ? new Date(inspectingAdmin.createdAt).toLocaleDateString([], { dateStyle: "short" })
                    : "N/A"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400">Login Security</span>
                <p className="font-extrabold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2FA Active
                </p>
              </div>
            </div>

            {/* Granted Capabilities Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#1B2A41]">Granted Platform Capabilities</h4>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {inspectingAdmin.role === "super_admin"
                    ? "Full Access (All 8 Modules)"
                    : `${inspectingAdmin.permissions?.length || 0} of 8 Modules Active`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_PERMISSIONS.map((p) => {
                  const Icon = p.icon;
                  const hasAccess = inspectingAdmin.role === "super_admin" || (Array.isArray(inspectingAdmin.permissions) && inspectingAdmin.permissions.includes(p.id));

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                        hasAccess
                          ? "bg-blue-50/50 border-blue-200/80"
                          : "bg-slate-50 border-slate-200/60 opacity-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        hasAccess ? "bg-blue-100 text-[#3F51F4]" : "bg-slate-200 text-slate-400"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-black truncate ${hasAccess ? "text-[#1B2A41]" : "text-slate-500"}`}>
                            {p.label}
                          </p>
                          {hasAccess ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Locked</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                {inspectingAdmin._id !== currentUser?._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInspectModal(false);
                      setDeleteModal({ open: true, admin: inspectingAdmin });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInspectModal(false);
                    openEditModal(inspectingAdmin);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Permissions
                </button>
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.admin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1B2A41]">Delete Administrator</h3>
                  <p className="text-xs text-slate-500 font-medium">Admin: {deleteModal.admin.name}</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ open: false, admin: null })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to delete <strong className="text-slate-900">{deleteModal.admin.name}</strong> ({deleteModal.admin.email})? This action will permanently remove their administrative credentials and access to the ZyCart platform.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, admin: null })}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleConfirmDeleteAdmin(deleteModal.admin)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#1B2A41]">
                Create Sub-Admin Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Admin Name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@zycart.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 chars, Aa1@"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Assign Permission Flags
                  </label>
                  <div className="flex gap-2 text-[10px] font-bold text-[#3F51F4]">
                    <button type="button" onClick={handleSelectAllPermissions} className="hover:underline cursor-pointer">Select All</button>
                    <span>•</span>
                    <button type="button" onClick={handleClearPermissions} className="hover:underline text-slate-400 cursor-pointer">Clear</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        formData.permissions.includes(perm.id)
                          ? "bg-blue-50 border-blue-200 text-[#1B2A41]"
                          : "bg-slate-50 border-slate-200 text-slate-600 opacity-60"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="mt-0.5 rounded text-[#3F51F4] focus:ring-0"
                      />
                      <div>
                        <span className="font-extrabold text-[11px] block">{perm.label}</span>
                        <span className="text-[9px] text-slate-400 leading-tight block">{perm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#3F51F4] hover:bg-[#3444C9] text-white font-black text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Creating..." : "Create Sub-Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full my-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#1B2A41]">
                Edit Administrator: {selectedAdmin.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Change Password (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#3F51F4]/40"
                />
              </div>

              {selectedAdmin.role !== "super_admin" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Configure Permission Flags
                    </label>
                    <div className="flex gap-2 text-[10px] font-bold text-[#3F51F4]">
                      <button type="button" onClick={handleSelectAllPermissions} className="hover:underline cursor-pointer">Select All</button>
                      <span>•</span>
                      <button type="button" onClick={handleClearPermissions} className="hover:underline text-slate-400 cursor-pointer">Clear</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                          formData.permissions.includes(perm.id)
                            ? "bg-blue-50 border-blue-200 text-[#1B2A41]"
                            : "bg-slate-50 border-slate-200 text-slate-600 opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="mt-0.5 rounded text-[#3F51F4] focus:ring-0"
                        />
                        <div>
                          <span className="font-extrabold text-[11px] block">{perm.label}</span>
                          <span className="text-[9px] text-slate-400 leading-tight block">{perm.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#3F51F4] hover:bg-[#3444C9] text-white font-black text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManagement;
