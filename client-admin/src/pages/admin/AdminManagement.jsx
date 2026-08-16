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
  const { user: currentUser } = useAuth();
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
    document.title = "Manage Admins | ZyCart Admin";
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
      toast.error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).");
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
      if (!payload.password) delete payload.password; // Don't overwrite password if blank

      const res = await axios.put(`/admin/admins/${selectedAdmin._id}`, payload);
      toast.success(res.data.message || "Admin updated successfully!");
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
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

    if (!window.confirm(`Are you sure you want to delete admin '${adminName}'? This action cannot be undone.`)) {
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

  if (loading) return <Loader />;

  const superAdminCount = admins.filter((a) => a.role === "super_admin").length;
  const activeCount = admins.filter((a) => a.isActive).length;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#1B2A41]">
              Admin Management
            </h1>
            <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              Super Admin Feature
            </span>
          </div>
          <p className="text-gray-600 mt-1 text-base">
            Create secondary admins, assign fine-grained permissions, and manage platform roles.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition shadow-md shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          Add New Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Admins</p>
            <p className="text-2xl font-bold text-[#1B2A41]">{admins.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Super Admins</p>
            <p className="text-2xl font-bold text-[#1B2A41]">{superAdminCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-xl">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Accounts</p>
            <p className="text-2xl font-bold text-[#1B2A41]">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1B2A41]">All System Admins ({admins.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Admin User</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Permissions</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {admins.map((adm) => {
                const isSuper = adm.role === "super_admin";
                const isSelf = adm._id === currentUser?._id;

                return (
                  <tr key={adm._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {adm.name}
                        {isSelf && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{adm.email}</div>
                      {adm.mobile && <div className="text-xs text-gray-400">📞 {adm.mobile}</div>}
                    </td>

                    <td className="py-4 px-6">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                          <ShieldCheck className="w-3.5 h-3.5" /> SUPER ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                          ADMIN
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(adm)}
                        disabled={isSelf}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          adm.isActive
                            ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                            : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {adm.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {adm.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      {isSuper ? (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                          ⚡ Full System Privileges (All Permissions)
                        </span>
                      ) : adm.permissions && adm.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {adm.permissions.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700 rounded-md border border-gray-200"
                            >
                              {p.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(adm)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => handleDeleteAdmin(adm._id, adm.name)}
                        disabled={isSelf}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={isSelf ? "Cannot delete your own account" : "Delete Admin"}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADMIN MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 my-8 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-[#1B2A41] flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-[#3F51F4]" /> Add New Admin Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@zycart.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="e.g. Sujoy@2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Min 8 chars: Upper, Lower, Number & Symbol</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      formData.role === "admin"
                        ? "border-[#3F51F4] bg-blue-50/50 text-[#3F51F4] font-bold"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="hidden"
                    />
                    <Shield className="w-5 h-5" />
                    <div>
                      <div className="text-sm">Regular Admin</div>
                      <div className="text-xs text-gray-500 font-normal">Restricted to selected permissions</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition ${
                      formData.role === "super_admin"
                        ? "border-purple-600 bg-purple-50/50 text-purple-700 font-bold"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="super_admin"
                      checked={formData.role === "super_admin"}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="hidden"
                    />
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm">Super Admin</div>
                      <div className="text-xs text-gray-500 font-normal">Full system control + Manage Admins</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Permissions Section */}
              {formData.role === "admin" && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Assign Permissions</label>
                    <div className="space-x-3 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPermissions}
                        className="text-gray-500 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-56 overflow-y-auto p-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                            isChecked
                              ? "border-blue-500 bg-blue-50/40 text-blue-900 font-semibold"
                              : "border-gray-200 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(perm.id)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <div>{perm.label}</div>
                            <div className="text-[11px] text-gray-500 font-normal">{perm.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition text-sm shadow-md disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6 my-8 border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <h3 className="text-xl font-bold text-[#1B2A41] flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-[#3F51F4]" /> Edit Admin: {selectedAdmin.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    New Password <span className="text-xs text-gray-400">(Leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Role</label>
                  <select
                    value={formData.role}
                    disabled={selectedAdmin._id === currentUser?._id}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none disabled:opacity-50"
                  >
                    <option value="admin">Regular Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    disabled={selectedAdmin._id === currentUser?._id}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3F51F4] outline-none disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Permissions Section */}
              {formData.role === "admin" && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800">Assigned Permissions</label>
                    <div className="space-x-3 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPermissions}
                        className="text-gray-500 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-56 overflow-y-auto p-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = formData.permissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                            isChecked
                              ? "border-blue-500 bg-blue-50/40 text-blue-900 font-semibold"
                              : "border-gray-200 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionToggle(perm.id)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <div>{perm.label}</div>
                            <div className="text-[11px] text-gray-500 font-normal">{perm.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-white font-semibold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90 transition text-sm shadow-md disabled:opacity-50"
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
