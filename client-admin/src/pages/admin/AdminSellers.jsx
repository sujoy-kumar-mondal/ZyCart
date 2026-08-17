import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye, ShieldAlert, CheckCircle2, Ban, Search, Store } from "lucide-react";
import toast from "react-hot-toast";

const AdminSellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const approveSeller = async (id) => {
    if (!window.confirm("Approve this seller account?")) return;
    try {
      await axios.patch(`/admin/sellers/approve/${id}`);
      toast.success("Seller approved successfully!");
      fetchSellers();
    } catch (err) {
      toast.error("Failed to approve seller.");
    }
  };

  const banSeller = async (id) => {
    if (!window.confirm("Ban this seller? All listed items will be hidden.")) return;
    try {
      await axios.patch(`/admin/sellers/ban/${id}`);
      toast.success("Seller banned successfully!");
      fetchSellers();
    } catch (err) {
      toast.error("Failed to ban seller.");
    }
  };

  const unbanSeller = async (id) => {
    try {
      await axios.patch(`/admin/sellers/unban/${id}`);
      toast.success("Seller unbanned successfully!");
      fetchSellers();
    } catch (err) {
      toast.error("Failed to unban seller.");
    }
  };

  useEffect(() => {
    document.title = "Merchant Directory | ZyCart Admin";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredSellers = sellers.filter((s) =>
    (s.shopName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Merchant Directory &amp; Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Verify business credentials, approve pending sellers, or manage ban statuses.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search store name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
          {filteredSellers.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-lg font-bold text-[#1B2A41]">No merchant stores found</p>
              <p className="text-xs text-slate-500">Try clearing search filters.</p>
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
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-extrabold text-sm flex items-center justify-center border border-purple-100 shrink-0">
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
                            ? "bg-red-100 text-red-800"
                            : s.isApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
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
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect
                          </button>

                          {!s.isApproved && !s.isBanned && (
                            <button
                              onClick={() => approveSeller(s._id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs transition"
                            >
                              Approve
                            </button>
                          )}

                          {!s.isBanned ? (
                            <button
                              onClick={() => banSeller(s._id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-xs transition"
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              onClick={() => unbanSeller(s._id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-xs transition"
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
    </div>
  );
};

export default AdminSellers;
