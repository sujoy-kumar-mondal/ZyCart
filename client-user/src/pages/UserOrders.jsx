import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Loader from "../components/Loader";
import { useSettings } from "../context/SettingsProvider";
import { Eye, Package, ArrowRight, Clock, CheckCircle, Calendar } from "lucide-react";

const UserOrders = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders/my-orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `My Orders | ${brandName}`;
    fetchOrders();
  }, [brandName]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">No Orders Yet</h2>
          <p className="text-slate-500 text-sm">
            You haven't placed any orders with ZyCart yet. Explore our catalog to get started!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] text-white font-extrabold text-sm shadow-md shadow-blue-500/20 hover:opacity-95 transition cursor-pointer"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">✓ Delivered</span>;
      case "Out for Delivery":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">🚚 Out for Delivery</span>;
      case "Shipped":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">✈️ Shipped</span>;
      case "Cancelled":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800">✕ Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800">⏳ Processing</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Order History</h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Track and review all your purchases across sellers
            </p>
          </div>
        </div>

        {/* Orders Card Stack */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6"
            >
              {/* Cancelled notice banner */}
              {order.status === "Cancelled" && (
                <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-red-800">
                    Cancelled by {order.cancelledBy === "User" ? "Customer (You)" : order.cancelledBy === "Seller" ? "Seller / Merchant" : "Platform Admin"}:
                    {order.cancellationReason && <span className="font-normal italic text-red-700 ml-1">"{order.cancellationReason}"</span>}
                  </span>
                  {order.cancelledAt && (
                    <span className="text-[11px] text-red-500 font-semibold shrink-0">
                      {new Date(order.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                </div>
              )}

              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Order Reference Number
                  </span>
                  <h3 className="font-mono font-black text-slate-900 text-lg">
                    #{order.parentOrderNumber || order._id.slice(-8)}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}

                  <button
                    onClick={() => navigate(`/my-orders/${order._id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-xs transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>

              {/* Merchant Packages Breakdown */}
              <div className="space-y-4">
                {order.childOrders?.map((child) => (
                  <div
                    key={child._id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                        Package from: <span className="font-extrabold text-slate-900">{child.seller?.shopName || "Verified Merchant"}</span>
                      </span>

                      <span className="text-xs font-bold text-slate-500 uppercase">
                        Status: <span className="text-slate-900 font-black">{child.status}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {child.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium text-slate-800 block">{item.title}</span>
                            <span className="text-xs text-slate-500 font-medium">Per Item Price: {currency}{item.price?.toLocaleString()} × {item.qty} unit(s)</span>
                          </div>
                          <span className="font-extrabold text-slate-900 shrink-0 ml-4">
                            {currency}{item.subtotal?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 font-bold">Package Amount</span>
                      <span className="text-base font-black text-slate-900">{currency}{child.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default UserOrders;
