import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Loader from "../components/Loader";
import { Eye, Package, ArrowRight, Clock, CheckCircle, Calendar } from "lucide-react";

const UserOrders = () => {
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
    document.title = "My Orders | ZyCart";
    fetchOrders();
  }, []);

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
            You haven't placed any orders with ZyCart yet. Explore our catalog to get started!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#3F51F4] text-white font-extrabold text-sm"
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
            <h1 className="text-3xl font-extrabold text-[#1B2A41]">My Order History</h1>
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
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Order Reference Number
                  </span>
                  <h3 className="font-mono font-black text-[#1B2A41] text-lg">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition"
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
                            <span className="text-xs text-slate-500 font-medium">Per Item Price: ₹{item.price?.toLocaleString()} × {item.qty} unit(s)</span>
                          </div>
                          <span className="font-extrabold text-slate-900 shrink-0 ml-4">
                            ₹{item.subtotal?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-baseline text-xs">
                      <span className="text-slate-500 font-bold">Package Amount</span>
                      <span className="text-base font-black text-[#1B2A41]">₹{child.amount?.toLocaleString()}</span>
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
