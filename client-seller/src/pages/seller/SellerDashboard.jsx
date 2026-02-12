import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH SELLER DASHBOARD DATA
  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/seller/dashboard");
      setData(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

    useEffect(() => {
      document.title = "Seller Dashboard | ZyCart";
    }, []);

  if (loading) return <Loader />;

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-20">
        Unable to load dashboard.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-12">

      {/* HEADER */}
      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
        "
      >
        <h1
          className="
            text-4xl font-extrabold
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            text-transparent bg-clip-text
          "
        >
          Seller Dashboard
        </h1>

        <p className="text-gray-700 mt-2 text-lg">
          Welcome back, {data.seller?.shopName || "Seller"}!
        </p>
      </div>

      {/* STATS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Total Products */}
        <div
          className="
            p-8 rounded-2xl text-center shadow-md
            bg-white/60 border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-xl font-semibold text-[#1B2A41]">
            Total Products
          </h3>
          <p
            className="
              text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.totalProducts}
          </p>
        </div>

        {/* Total Orders */}
        <div
          className="
            p-8 rounded-2xl text-center shadow-md
            bg-white/60 border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-xl font-semibold text-[#1B2A41]">
            Total Orders
          </h3>
          <p
            className="
              text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.totalOrders}
          </p>
        </div>

        {/* Pending Shipments */}
        <div
          className="
            p-8 rounded-2xl text-center shadow-md
            bg-white/60 border border-[#8FD6F6]/40
          "
        >
          <h3 className="text-xl font-semibold text-[#1B2A41]">
            Pending Shipments
          </h3>
          <p
            className="
              text-4xl font-extrabold mt-3
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              text-transparent bg-clip-text
            "
          >
            {data.pendingShipments}
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
        "
      >
        <h2 className="text-3xl font-bold mb-6 text-[#1B2A41]">
          Quick Actions
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          
          <Link
            to="/seller/products"
            className="
              w-full py-3 text-center font-semibold rounded-xl
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] 
              text-white shadow-md hover:opacity-90 transition
            "
          >
            Manage Products
          </Link>

          <Link
            to="/seller/orders"
            className="
              w-full py-3 text-center font-semibold rounded-xl
              bg-linear-to-r from-[#8FD6F6] to-[#6A8EF0]
              text-[#1B2A41] shadow hover:opacity-90 transition
            "
          >
            View Orders
          </Link>

          <Link
            to="/seller/products?add=true"
            className="
              w-full py-3 text-center font-semibold rounded-xl
              bg-green-500 hover:bg-green-600
              text-white shadow-md transition
            "
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
