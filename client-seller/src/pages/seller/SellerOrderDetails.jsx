import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Calendar, MapPin, CheckCircle2, User, Phone, Mail, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

const SellerOrderDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const globalCommissionRate = settings?.platformCommissionRate ?? 5;
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/seller/orders/${orderId}`);
      setOrder(res.data.order);
      document.title = `Order Details #${res.data.order?.parentOrderId?.parentOrderNumber || ""} | ${brandName} Merchant`;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load order");
      navigate("/seller/orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(`/seller/orders/status/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/seller/orders")}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3F51F4] hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Orders
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Order Fulfillment Breakdown
            </h1>
            <p className="text-xs text-slate-500 font-mono font-bold">
              Parent Order #{order?.parentOrderId?.parentOrderNumber}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-full text-xs font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
              Status: {order?.status}
            </span>
          </div>
        </div>

        {/* 2-Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Items & Shipping Address */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Items Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Package Purchased Items
              </h2>

              <div className="space-y-3">
                {order?.items?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-sm gap-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900">{item.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                        <span>Per Item Price: <span className="font-bold text-slate-800">{currency}{item.price?.toLocaleString()}</span></span>
                        <span>•</span>
                        <span>Quantity: <span className="font-bold text-slate-800">{item.qty} unit(s)</span></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Subtotal</span>
                      <span className="font-black text-slate-900 text-base">
                        {currency}{item.subtotal?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-[#3F51F4]" />
                <h2 className="text-lg font-extrabold text-[#1B2A41]">
                  Customer Shipping Address
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm font-semibold text-slate-800 space-y-1">
                <p className="font-bold text-slate-900">{order?.parentOrderId?.address?.line1}</p>
                <p>
                  {order?.parentOrderId?.address?.city}, {order?.parentOrderId?.address?.state}{" "}
                  {order?.parentOrderId?.address?.postalCode}
                </p>
                <p className="text-slate-500 pt-1">
                  Recipient Contact Phone: <span className="font-bold text-slate-800">{order?.userId?.mobile || "N/A"}</span>
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: Actions & Earnings Summary */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Actions Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Fulfillment Actions
              </h2>

              <div className="space-y-3">
                {order?.status !== "Shipped" && order?.status !== "Delivered" ? (
                  <>
                    {order?.status === "Confirmed" && (
                      <button
                        onClick={() => updateOrderStatus("Packed")}
                        disabled={updating}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-white text-xs bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {updating ? "Updating..." : "Mark as Packed"}
                      </button>
                    )}

                    <button
                      onClick={() => updateOrderStatus("Shipped")}
                      disabled={updating}
                      className="w-full py-3.5 rounded-2xl font-extrabold text-white text-xs bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Mark as Shipped"}
                    </button>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-black text-emerald-900 text-xs">Fulfillment Complete</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">Package dispatched to carrier.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Cut Summary */}
            {(() => {
              const commRate = settings?.platformCommissionRate ?? order?.commissionRate ?? globalCommissionRate;
              const commAmt = Math.round(((order?.amount || 0) * commRate) / 100);
              const earnings = (order?.amount || 0) - commAmt;

              return (
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                  <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                    Earnings Breakdown
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>Gross Package Value</span>
                      <span className="font-bold text-slate-900">{currency}{order?.amount?.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>Platform Commission ({commRate}%)</span>
                      <span className="text-red-500 font-bold">- {currency}{commAmt?.toLocaleString()}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900 text-sm">Net Seller Payout ({100 - commRate}%)</span>
                      <span className="text-2xl font-black text-emerald-600">
                        {currency}{earnings?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Order Timestamps Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3F51F4]" /> Order Status Timeline
              </h2>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Order Placed Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order?.placedAt
                      ? new Date(order.placedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : order?.parentOrderId?.placedAt
                      ? new Date(order.parentOrderId.placedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : order?.parentOrderId?.createdAt
                      ? new Date(order.parentOrderId.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : order?.createdAt
                      ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : "N/A"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase">Packed Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order?.packedAt
                      ? new Date(order.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : order?.parentOrderId?.packedAt
                      ? new Date(order.parentOrderId.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : ["Packed", "Shipped", "Out for Delivery", "Delivered"].includes(order?.status)
                      ? "Packed by merchant"
                      : "Pending packaging"}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase">Shipped Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order?.shippedAt
                      ? new Date(order.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : order?.parentOrderId?.shippedAt
                      ? new Date(order.parentOrderId.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : ["Shipped", "Out for Delivery", "Delivered"].includes(order?.status)
                      ? "Shipped to customer"
                      : "Pending dispatch"}
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

export default SellerOrderDetails;
