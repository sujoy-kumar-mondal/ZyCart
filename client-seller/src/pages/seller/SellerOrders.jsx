import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { toast } from "react-hot-toast";
import { Eye, Package, ShoppingBag, Truck, CheckCircle2, ArrowRight, Calendar } from "lucide-react";

const SellerOrders = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const commissionRate = settings?.platformCommissionRate ?? 5;
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/seller/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Customer Orders | ZyCart Merchant";
    fetchOrders();
  }, []);

  const updateStatus = async (childOrderId, newStatus) => {
    try {
      await axios.patch(`/seller/orders/status/${childOrderId}`, {
        status: newStatus,
      });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

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
          <div className="w-16 h-16 bg-blue-50 text-[#3F51F4] rounded-full flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h2 className="text-2xl font-extrabold text-[#1B2A41]">No Orders Yet</h2>
          <p className="text-slate-500 text-sm">
            You don't have any customer orders yet. Optimize your product listings to boost sales!
          </p>
          <Link
            to="/seller/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#3F51F4] text-white font-extrabold text-sm"
          >
            Manage Catalog Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Shipped":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">✈️ Shipped</span>;
      case "Packed":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">📦 Packed</span>;
      case "Delivered":
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">✓ Delivered</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">⏳ Confirmed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B2A41]">Customer Fulfillment Orders</h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Process customer packages, update dispatch statuses, and track earnings
            </p>
          </div>
        </div>

        {/* Orders Stack */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Parent Order Number
                  </span>
                  <h3 className="font-mono font-black text-[#1B2A41] text-lg">
                    #{order.parentOrderId?.parentOrderNumber || order._id.slice(-8)}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(order.status)}

                  <button
                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition"
                  >
                    <Eye className="w-4 h-4" /> Order Details
                  </button>
                </div>
              </div>

              {/* Package Items Breakdown */}
              <div className="space-y-2 text-sm text-slate-700">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.title}</span>
                      <span className="text-xs text-slate-500 font-medium">Per Item Price: {currency}{item.price?.toLocaleString()} × {item.qty} unit(s)</span>
                    </div>
                    <span className="font-black text-slate-900 shrink-0 ml-4">
                      {currency}{item.subtotal?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total & Seller Cut */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400">Package Subtotal: </span>
                  <span className="text-lg font-black text-[#1B2A41]">{currency}{order.amount?.toLocaleString()}</span>
                  <span className="text-xs font-bold text-emerald-600 ml-2">
                    (Your Net Payout: {currency}{(order.amount * (1 - commissionRate / 100))?.toLocaleString()} after {commissionRate}% platform fee)
                  </span>
                </div>

                {/* Status Action Buttons */}
                {order.status !== "Shipped" && order.status !== "Delivered" && (
                  <div className="flex items-center gap-3">
                    {order.status === "Confirmed" && (
                      <button
                        onClick={() => updateStatus(order._id, "Packed")}
                        className="px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition"
                      >
                        Mark as Packed
                      </button>
                    )}

                    <button
                      onClick={() => updateStatus(order._id, "Shipped")}
                      className="px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md shadow-blue-500/20 hover:opacity-95 transition"
                    >
                      Mark as Shipped
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SellerOrders;
