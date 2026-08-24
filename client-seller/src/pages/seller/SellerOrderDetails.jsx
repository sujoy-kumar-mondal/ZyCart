import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Calendar, MapPin, CheckCircle2, User, Phone, Mail, DollarSign, XCircle, AlertTriangle, X } from "lucide-react";
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

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Item out of stock / damaged");
  const [cancelReasonDetails, setCancelReasonDetails] = useState("");
  const [cancelling, setCancelling] = useState(false);

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

  const canCancel = order && !["Shipped", "Delivered", "Cancelled"].includes(order.status);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    const finalReason = cancelReasonPreset === "Other"
      ? cancelReasonDetails.trim()
      : cancelReasonDetails.trim()
      ? `${cancelReasonPreset}: ${cancelReasonDetails.trim()}`
      : cancelReasonPreset;

    if (!finalReason) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    try {
      setCancelling(true);
      const res = await axios.post(`/seller/orders/cancel/${orderId}`, { reason: finalReason });
      toast.success(res.data.message || "Package cancelled successfully!");
      setShowCancelModal(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel package.");
    } finally {
      setCancelling(false);
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
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Customer Orders
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Order Fulfillment Breakdown
            </h1>
            <p className="text-xs text-slate-500 font-mono font-bold">
              Parent Order #{order?.parentOrderId?.parentOrderNumber}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-black uppercase border ${order?.status === "Cancelled" ? "bg-red-100 text-red-800 border-red-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}`}>
              Status: {order?.status}
            </span>
          </div>
        </div>

        {/* Cancellation Notice Banner */}
        {order?.status === "Cancelled" && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-red-950 text-base">
                  Package Cancelled {order.cancelledBy ? `by ${order.cancelledBy === "User" ? "Customer" : order.cancelledBy === "Seller" ? "Merchant (You)" : "Platform Administration"}` : ""}
                </h3>
                <p className="text-xs text-red-600 font-semibold">
                  Cancelled on {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                </p>
              </div>
            </div>
            {order.cancellationReason && (
              <div className="pt-2 border-t border-red-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">Reason for Cancellation:</p>
                <p className="text-sm font-semibold text-red-950 mt-1 bg-white/80 p-3.5 rounded-2xl border border-red-200">
                  "{order.cancellationReason}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Items & Shipping Address */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Items Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
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
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-extrabold text-slate-900">
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
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Fulfillment Actions
              </h2>

              <div className="space-y-3">
                {order?.status === "Cancelled" ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-red-900 text-xs">Package Cancelled</p>
                      <p className="text-[10px] text-red-700 font-semibold">No further fulfillment actions required.</p>
                    </div>
                  </div>
                ) : order?.status !== "Shipped" && order?.status !== "Delivered" ? (
                  <>
                    {order?.status === "Confirmed" && (
                      <button
                        onClick={() => updateOrderStatus("Packed")}
                        disabled={updating}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-white text-xs bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 cursor-pointer"
                      >
                        {updating ? "Updating..." : "Mark as Packed"}
                      </button>
                    )}

                    <button
                      onClick={() => updateOrderStatus("Shipped")}
                      disabled={updating}
                      className="w-full py-3.5 rounded-2xl font-extrabold text-white text-xs bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      {updating ? "Updating..." : "Mark as Shipped"}
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-3 rounded-2xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs transition cursor-pointer"
                      >
                        Cancel Package
                      </button>
                    )}
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
                  <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
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
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Order Status Timeline
              </h2>

              <div className="space-y-3 text-xs">
                {/* Placed Date & Time */}
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

                {/* If Cancelled */}
                {order?.status === "Cancelled" ? (
                  <>
                    {/* Show Packed only if it actually was packed before cancel */}
                    {(order?.packedAt || order?.parentOrderId?.packedAt) && (
                      <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Packed Date &amp; Time</span>
                        <p className="font-extrabold text-slate-900">
                          {new Date(order.packedAt || order.parentOrderId.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                        </p>
                      </div>
                    )}

                    {/* Show Shipped only if it actually was shipped before cancel */}
                    {(order?.shippedAt || order?.parentOrderId?.shippedAt) && (
                      <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Shipped Date &amp; Time</span>
                        <p className="font-extrabold text-slate-900">
                          {new Date(order.shippedAt || order.parentOrderId.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                        </p>
                      </div>
                    )}

                    {/* Cancelled Date & Time (Highlighted in Red/Rose) */}
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Cancelled Date &amp; Time</span>
                        {(order?.cancelledBy || order?.parentOrderId?.cancelledBy) && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-red-200/60 text-red-800 uppercase">
                            By {order?.cancelledBy || order?.parentOrderId?.cancelledBy}
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-900">
                        {order?.cancelledAt
                          ? new Date(order.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : order?.parentOrderId?.cancelledAt
                          ? new Date(order.parentOrderId.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "N/A"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Packed Date & Time */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Packed Date &amp; Time</span>
                      <p className="font-extrabold text-slate-900">
                        {order?.packedAt
                          ? new Date(order.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : order?.parentOrderId?.packedAt
                          ? new Date(order.parentOrderId.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Pending Packing"}
                      </p>
                    </div>

                    {/* Shipped Date & Time */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Shipped Date &amp; Time</span>
                      <p className="font-extrabold text-slate-900">
                        {order?.shippedAt
                          ? new Date(order.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : order?.parentOrderId?.shippedAt
                          ? new Date(order.parentOrderId.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Pending Dispatch"}
                      </p>
                    </div>

                    {/* Delivered Date & Time */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Delivered Date &amp; Time</span>
                      <p className="font-extrabold text-slate-900">
                        {order?.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : order?.parentOrderId?.deliveredAt
                          ? new Date(order.parentOrderId.deliveredAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "In Transit / Not Delivered Yet"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Cancel Package Fulfillment</h3>
                  <p className="text-xs text-slate-400 font-semibold">Order #{order?.parentOrderId?.parentOrderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                >
                  <option value="Item out of stock / damaged">Item out of stock / damaged</option>
                  <option value="Pricing or inventory discrepancy">Pricing or inventory discrepancy</option>
                  <option value="Cannot fulfill delivery to recipient area">Cannot fulfill delivery to recipient area</option>
                  <option value="Customer requested cancellation via seller chat">Customer requested cancellation via seller chat</option>
                  <option value="Other">Other reason (specify below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Merchant Note / Reason Details {cancelReasonPreset === "Other" ? <span className="text-red-500">*</span> : "(Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={cancelReasonDetails}
                  onChange={(e) => setCancelReasonDetails(e.target.value)}
                  placeholder="Provide additional details regarding this package cancellation..."
                  required={cancelReasonPreset === "Other"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Cancelling this package will restore product inventory and notify both customer and platform administration.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-6 py-3 rounded-2xl font-extrabold text-sm text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Package Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderDetails;
