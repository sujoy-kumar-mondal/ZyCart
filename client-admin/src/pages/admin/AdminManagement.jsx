import React, { useEffect, useState } from "react";
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
  AlertCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthProvider";

const ALL_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users", desc: "View, ban, unban, delete customer accounts" },
  { id: "manage_sellers", label: "Manage Sellers", desc: "Approve, view, ban, unban seller accounts" },
  { id: "manage_orders", label: "Manage Orders", desc: "View and update status of customer orders" },
  { id: "manage_products", label: "Manage Products", desc: "Moderate seller product listings" },
  { id: "manage_categories", label: "Manage Categories", desc: "Edit categories and dynamic schemas" },
  { id: "manage_admins", label: "Manage Admins", desc: "Create, edit, and delete admin accounts" },
  { id: "view_analytics", label: "View Analytics", desc: "Access dashboard statistics and reports" },
  { id: "system_settings", label: "System Settings", desc: "Configure global system parameters" },
];

const AdminManagement = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      setSelectedAdmin(null);
      fetchAdmins();
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (adminId === currentUser?._id) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete admin '${adminName}'?`)) {
      return;
    }

    try {
      const res = await axios.delete(`/admin/admins/${adminId}`);
      toast.success(res.data.message || "Admin deleted successfully");
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete admin");
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
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

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
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Sub-Admin Team &amp; Permissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Create sub-admin accounts and configure fine-grained operational permissions.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:opacity-95 transition flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add Sub-Admin
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total System Admins</p>
            <p className="text-3xl font-black text-[#3F51F4]">{admins.length}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">Super Admins</p>
            <p className="text-3xl font-black text-purple-600">{superAdminCount}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Active Accounts</p>
            <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 whitespace-nowrap">Admin User</th>
                  <th className="px-6 py-4 whitespace-nowrap">Role</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 whitespace-nowrap">Permissions Matrix</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                {admins.map((adm) => {
                  const isSuper = adm.role === "super_admin";
                  const isSelf = adm._id === currentUser?._id;

                  return (
                    <tr key={adm._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {adm.name ? adm.name[0].toUpperCase() : "A"}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              {adm.name}
                              {isSelf && (
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-blue-100 text-blue-800 rounded-full">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{adm.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          isSuper ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {isSuper ? "Super Admin" : "Sub-Admin"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(adm)}
                          disabled={isSelf}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition ${
                            adm.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          } disabled:opacity-50`}
                        >
                          {adm.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        {isSuper ? (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            Full Privileges
                          </span>
                        ) : adm.permissions && adm.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {adm.permissions.map((p) => (
                              <span key={p} className="text-[9px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                                {p.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold text-[10px]">No permissions</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(adm)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteAdmin(adm._id, adm.name)}
                            disabled={isSelf}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition disabled:opacity-40"
                          >
                            Delete
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
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
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              {/* Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Assign Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="rounded text-[#3F51F4]"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md"
                >
                  {submitting ? "Creating..." : "Create Account"}
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
                Edit Sub-Admin: {selectedAdmin.name}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="rounded text-[#3F51F4]"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white font-extrabold text-xs shadow-md"
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
