import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

const AdminSellers = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH SELLERS
  const fetchSellers = async () => {
    try {
      const res = await axios.get("/admin/sellers");
      setSellers(res.data.sellers || []);
    } catch (error) {
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // APPROVE SELLER
  const approveSeller = async (id) => {
    if (!window.confirm("Approve this seller?")) return;
    try {
      await axios.patch(`/admin/sellers/approve/${id}`);
      toast.success("Seller approved successfully!");
      fetchSellers();
    } catch (err) {
      toast.error("Failed to approve seller.");
    }
  };

  // BAN SELLER
  const banSeller = async (id) => {
    if (!window.confirm("Ban this seller? All products will be unavailable.")) return;
    try {
      await axios.patch(`/admin/sellers/ban/${id}`);
      toast.success("Seller banned successfully!");
      fetchSellers();
    } catch (err) {
      toast.error("Failed to ban seller.");
    }
  };

  // UNBAN SELLER
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
    document.title = "Sellers | ZyCart";
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-10 py-10">

      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
        "
      >
        Manage Sellers
      </h1>

      {/* Table Card */}
      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
          overflow-x-auto
        "
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300 text-gray-700">
              <th className="py-3">Shop Name</th>
              <th>Owner</th>
              <th>Shop Type</th>
              <th>Status</th>
              <th>Products</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sellers.map((s) => (
              <tr
                key={s._id}
                className="border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium">{s.shopName}</td>
                <td>{s.name || "-"}</td>
                <td>{s.shopType}</td>

                <td>
                  <span
                    className={`
                      px-3 py-1 rounded-lg text-xs text-white font-medium
                      ${s.isBanned
                        ? "bg-linear-to-r from-red-500 to-red-700"
                        : s.isApproved
                          ? "bg-linear-to-r from-green-400 to-green-600"
                          : "bg-linear-to-r from-yellow-400 to-yellow-600"
                      }
                    `}
                  >
                    {s.isBanned
                      ? "Banned"
                      : s.isApproved
                        ? "Approved"
                        : "Pending"}
                  </span>
                </td>

                <td className="font-semibold text-[#1B2A41]">
                  {s.totalProducts}
                </td>

                <td className="text-right space-x-4">
                  <button
                    onClick={() => navigate(`/admin/sellers/${s._id}`)}
                    className="text-[#3F51F4] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  {!s.isApproved && !s.isBanned && (
                    <button
                      onClick={() => approveSeller(s._id)}
                      className="text-green-600 hover:underline font-semibold"
                    >
                      Approve
                    </button>
                  )}

                  {!s.isBanned ? (
                    <button
                      onClick={() => banSeller(s._id)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      onClick={() => unbanSeller(s._id)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Unban
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default AdminSellers;
