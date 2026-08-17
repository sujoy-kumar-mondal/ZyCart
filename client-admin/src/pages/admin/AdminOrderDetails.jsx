import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle, TrendingUp, ShoppingBag, Package } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    document.title = "Order Audit Details | ZyCart Admin";
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load order");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`/admin/orders/status/${orderId}`, { status: newStatus });
      toast.success("Order status updated successfully!");
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!order) return null;

  const totalRevenue = order.totalAmount || 0;
  const platformFee = totalRevenue * 0.2;
  const sellerRevenue = totalRevenue * 0.8;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/orders")}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
                  Order #{order.parentOrderNumber}
                </h1>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Child Seller Packages */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Itemized Seller Sub-Packages ({order.childOrders?.length || 0})
              </h2>

              <div className="space-y-4">
                {order.childOrders?.map((child) => (
                  <div key={child._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div>
                        <p className="font-extrabold text-sm text-[#1B2A41]">{child.seller?.shopName || "Merchant Store"}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{child.seller?.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                        {child.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      {child.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>{item.title} × {item.qty}</span>
                          <span className="font-black text-slate-900">₹{item.subtotal?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 flex justify-between font-black text-xs text-slate-900">
                      <span>Package Amount:</span>
                      <span>₹{child.amount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Customer Delivery Address
              </h2>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs font-semibold text-slate-700">
                <p className="font-black text-slate-900">{order.address?.line1}</p>
                <p>{order.address?.city}, {order.address?.state} — {order.address?.postalCode}</p>
                <p className="text-slate-500 pt-1">
                  Recipient: <span className="font-bold text-slate-900">{order.user?.name}</span> ({order.user?.mobile || "No phone"})
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar Audit Breakdown */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            
            {/* Financial Audit */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Financial Split Audit
              </h2>

              <div className="space-y-3 text-xs font-semibold">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Total Amount</span>
                    <span className="font-black text-slate-900">₹{totalRevenue?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600">
                    <span>ZyCart Platform Fee (20%)</span>
                    <span className="font-black">₹{platformFee?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-purple-600">
                    <span>Net Seller Cut (80%)</span>
                    <span className="font-black">₹{sellerRevenue?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Payment Status</span>
                  <p className="font-black text-xs text-slate-900 uppercase">{order.paymentStatus || "completed"}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Order Status Actions
              </h2>

              <div className="space-y-3">
                {order.status === "Shipped" && (
                  <button
                    onClick={() => updateOrderStatus("Out for Delivery")}
                    disabled={updating}
                    className="w-full py-4 rounded-2xl font-extrabold text-xs text-white bg-amber-500 hover:bg-amber-600 shadow-md transition disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Mark Out for Delivery"}
                  </button>
                )}

                {order.status === "Out for Delivery" && (
                  <button
                    onClick={() => updateOrderStatus("Delivered")}
                    disabled={updating}
                    className="w-full py-4 rounded-2xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Mark as Delivered"}
                  </button>
                )}
              </div>
            </div>

            {/* Status Timeline & Timestamps */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3F51F4]" /> Order Status Timestamps
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Placed Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order.placedAt ? new Date(order.placedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase">Packed Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order.packedAt ? new Date(order.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : ["Packed", "Shipped", "Out for Delivery", "Delivered"].includes(order.status) ? "Packed by merchant" : "Pending packaging"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase">Shipped Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order.shippedAt ? new Date(order.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : ["Shipped", "Out for Delivery", "Delivered"].includes(order.status) ? "Shipped to logistics" : "Pending dispatch"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Delivered Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : order.status === "Delivered" ? "Delivered to customer" : "Pending delivery"}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetails;
