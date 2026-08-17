import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye, User, Ban, Trash2, Search, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const banUser = async (id) => {
    if (!window.confirm("Ban this customer account?")) return;
    try {
      await axios.patch(`/admin/users/ban/${id}`);
      toast.success("User banned successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to ban user.");
    }
  };

  const unbanUser = async (id) => {
    try {
      await axios.patch(`/admin/users/unban/${id}`);
      toast.success("User unbanned successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to unban user.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user permanently? This action cannot be undone.")) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  useEffect(() => {
    document.title = "Customer Directory | ZyCart Admin";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mobile || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Customer Directory ({users.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Review shopper profiles, order participation, and account ban status controls.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <User className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-lg font-bold text-[#1B2A41]">No customer accounts found</p>
              <p className="text-xs text-slate-500">Try clearing search filters.</p>
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#3F51F4] to-[#6A8EF0] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
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
                          u.isBanned ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>

                          {!u.isBanned ? (
                            <button
                              onClick={() => banUser(u._id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => unbanUser(u._id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs transition"
                            >
                              Unban
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(u._id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition"
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
    </div>
  );
};

export default AdminUsers;
