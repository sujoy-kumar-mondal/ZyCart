import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH SUPPLIERS
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/admin/suppliers");
      setSuppliers(res.data.suppliers || []);
    } catch (error) {
      console.error("Supplier fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // APPROVE SUPPLIER
  const approveSupplier = async (id) => {
    if (!window.confirm("Approve this supplier?")) return;
    try {
      await axios.patch(`/admin/suppliers/approve/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Failed to approve supplier.");
    }
  };

  // BAN SUPPLIER
  const banSupplier = async (id) => {
    if (!window.confirm("Ban this supplier? All products will be unavailable.")) return;
    try {
      await axios.patch(`/admin/suppliers/ban/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Failed to ban supplier.");
    }
  };

  // UNBAN SUPPLIER
  const unbanSupplier = async (id) => {
    try {
      await axios.patch(`/admin/suppliers/unban/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert("Failed to unban supplier.");
    }
  };

  useEffect(() => {
    document.title = "Suppliers | ZyCart";
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-2xl container mx-auto px-14 space-y-10 py-10">

      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
        "
      >
        Manage Suppliers
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
            {suppliers.map((s) => (
              <tr
                key={s._id}
                className="border-b border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              >
                <td className="py-3 font-medium">{s.shopName}</td>
                <td>{s.owner?.name || "-"}</td>
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
                  {!s.isApproved && !s.isBanned && (
                    <button
                      onClick={() => approveSupplier(s._id)}
                      className="text-green-600 hover:underline font-semibold"
                    >
                      Approve
                    </button>
                  )}

                  {!s.isBanned ? (
                    <button
                      onClick={() => banSupplier(s._id)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      onClick={() => unbanSupplier(s._id)}
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

export default AdminSuppliers;
