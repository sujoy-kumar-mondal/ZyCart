import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, Truck, PlusCircle, ArrowRight, Store, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/seller/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Merchant Dashboard | ZyCart";
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <p className="text-4xl">⚠️</p>
          <h2 className="text-xl font-extrabold text-[#1B2A41]">Unable to Load Merchant Dashboard</h2>
          <p className="text-slate-500 text-sm">Please refresh or check your merchant session authorization.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Catalog Products",
      value: data.totalProducts || 0,
      icon: Package,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50/50",
      link: "/seller/products",
    },
    {
      title: "Total Customer Orders",
      value: data.totalOrders || 0,
      icon: ShoppingBag,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50/50",
      link: "/seller/orders",
    },
    {
      title: "Pending Dispatch Shipments",
      value: data.pendingShipments || 0,
      icon: Truck,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50/50",
      link: "/seller/orders",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Welcome Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-900 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Active Merchant Session
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#1B2A41]">
              Welcome Back,{" "}
              <span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                {data.seller?.shopName || "Merchant Store"}
              </span>
            </h1>

            <p className="text-sm text-slate-500 font-semibold max-w-xl">
              Manage your product listings, inventory levels, customer fulfillment orders, and store profile.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 z-10">
            <Link
              to="/seller/products?add=true"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition transform active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New Product
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const IconComp = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-xl transition duration-300 space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stat.gradient} text-white flex items-center justify-center shadow-md`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <Link
                    to={stat.link}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-[#3F51F4] hover:bg-blue-50 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-black text-[#1B2A41] mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Action Hub & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Quick Actions Grid */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-extrabold text-[#1B2A41]">
                Quick Store Operations
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Fast Shortcuts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/seller/products"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition group space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#3F51F4] flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-[#3F51F4] transition">
                  Manage Product Inventory
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update pricing, active discounts, stock quantity, and images.
                </p>
              </Link>

              <Link
                to="/seller/orders"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50 transition group space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition">
                  Process Customer Orders
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Review customer orders, update shipping statuses, and track fulfillment.
                </p>
              </Link>

              <Link
                to="/seller/products?add=true"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/50 transition group space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-700 transition">
                  Create Product Listing
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Add a new item to your store catalog with multi-image gallery.
                </p>
              </Link>

              <Link
                to="/seller/profile"
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/50 transition group space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-700 transition">
                  Store Profile &amp; Payouts
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Update shop name, GSTIN, bank details, and business contact info.
                </p>
              </Link>
            </div>
          </div>

          {/* Right: Merchant Tips & Health Alert */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg">Sales Growth Tip</h3>
              <p className="text-xs text-blue-200 leading-relaxed font-normal">
                Products with at least 3 high-quality images and clear discount expiry dates receive up to 40% higher conversion on ZyCart.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SellerDashboard;
