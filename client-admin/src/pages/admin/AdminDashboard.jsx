import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH ADMIN DASHBOARD DATA
  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/admin/dashboard");
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    document.title = "Admin Dashboard | ZyCart";
  }, []);

  if (loading) return <Loader />;

  if (!data) {
    return (
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 text-center py-20 text-gray-600">
        Unable to load dashboard.
      </div>
    );
  }

  return (
    <div
      className="
        max-w-screen-2xl container mx-auto px-4 md:px-14 py-12
        space-y-10
        bg-linear-to-br from-[#C3F2EC] via-[#8FD6F6] to-[#3F51F4]/10
      "
    >
      {/* Header */}
      <div
        className="
          w-full p-6 rounded-2xl
          bg-white shadow-xl border border-[#8FD6F6]/40
        "
      >
        <h1
          className="
            text-3xl md:text-4xl font-extrabold
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            text-transparent bg-clip-text
          "
        >
          Admin Dashboard
        </h1>
        <p className="text-gray-700 mt-2">
          Overview of system users, sellers, and orders.
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="
            p-6 rounded-2xl text-center shadow-md
            bg-white border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-lg font-semibold text-[#1B2A41]">Total Users</h3>
          <p
            className="
              text-3xl md:text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.users}
          </p>
        </div>

        <div
          className="
            p-6 rounded-2xl text-center shadow-md
            bg-white border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-lg font-semibold text-[#1B2A41]">Total Sellers</h3>
          <p
            className="
              text-3xl md:text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.sellers}
          </p>
        </div>

        <div
          className="
            p-6 rounded-2xl text-center shadow-md
            bg-white border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-lg font-semibold text-[#1B2A41]">Total Orders</h3>
          <p
            className="
              text-3xl md:text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.orders}
          </p>
        </div>

        <div
          className="
            p-6 rounded-2xl text-center shadow-md
            bg-white border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-lg font-semibold text-[#1B2A41]">Pending Deliveries</h3>
          <p
            className="
              text-3xl md:text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.pendingDeliveries}
          </p>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div
        className="
          p-6 rounded-2xl bg-white shadow-xl border border-[#8FD6F6]/40
        "
      >
        <h2 className="text-2xl font-semibold mb-4 text-[#1B2A41]">Manage</h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="
              block w-full text-center py-3 rounded-xl
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-white font-semibold shadow-md hover:opacity-95 transition
            "
          >
            Users
          </Link>

          <Link
            to="/admin/sellers"
            className="
              block w-full text-center py-3 rounded-xl
              border border-[#6A8EF0] text-[#1B2A41] bg-white
              hover:bg-[#F7FBFF] transition shadow-sm font-semibold
            "
          >
            Sellers
          </Link>

          <Link
            to="/admin/orders"
            className="
              block w-full text-center py-3 rounded-xl
              bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md
              transition
            "
          >
            Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
