import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle, TrendingUp, ShoppingBag, Package, XCircle, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const commissionRate = settings?.platformCommissionRate ?? 5;
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Fraudulent order or suspicious transaction");
  const [cancelReasonDetails, setCancelReasonDetails] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    document.title = `Order Audit Details | ${brandName} Admin`;
  }, [orderId, brandName]);

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

  const canCancel = order && !["Delivered", "Cancelled"].includes(order.status);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    const finalReason = cancelReasonPreset === "Other"
      ? cancelReasonDetails.trim()
      : cancelReasonDetails.trim()
      ? `${cancelReasonPreset}: ${cancelReasonDetails.trim()}`
      : cancelReasonPreset;

    if (!finalReason) {
      toast.error("Please provide an executive cancellation reason.");
      return;
    }

    try {
      setCancelling(true);
      const res = await axios.post(`/admin/orders/cancel/${orderId}`, { reason: finalReason });
      toast.success(res.data.message || "Order cancelled by Admin successfully!");
      setShowCancelModal(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order.");
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

  const totalRevenue = order.totalAmount || 0;
  const platformFee = Math.round((totalRevenue * commissionRate) / 100);
  const sellerRevenue = totalRevenue - platformFee;

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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Order #{order.parentOrderNumber}
                </h1>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" : order.status === "Cancelled" ? "bg-red-100 text-red-800 border border-red-200" : "bg-blue-100 text-blue-800"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
              </p>
            </div>
          </div>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Cancel Order (Admin Override)
            </button>
          )}
        </div>

        {/* Cancellation Notice Banner */}
        {order.status === "Cancelled" && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-red-950 text-base">
                  Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy === "Admin" ? "Platform Administrator" : order.cancelledBy === "User" ? "Customer" : "Merchant / Seller"}` : ""}
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

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Child Seller Packages */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Itemized Seller Sub-Packages ({order.childOrders?.length || 0})
              </h2>

              <div className="space-y-4">
                {order.childOrders?.map((child) => (
                  <div key={child._id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{child.seller?.shopName || "Merchant Store"}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{child.seller?.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                        {child.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      {child.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                          <div>
                            <p className="font-bold text-slate-900">{item.title}</p>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              Per Item Price: <span className="font-bold text-slate-800">{currency}{item.price?.toLocaleString()}</span> × {item.qty} unit(s)
                            </p>
                          </div>
                          <span className="font-black text-slate-900 text-sm shrink-0 ml-4">
                            {currency}{item.subtotal?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200/60 pt-2 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between font-black text-slate-900">
                        <span>Package Amount:</span>
                        <span>{currency}{child.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-600 text-[11px]">
                        <span>Platform Commission ({commissionRate}%):</span>
                        <span>{currency}{Math.round((child.amount * commissionRate) / 100)?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-purple-600 text-[11px]">
                        <span>Net Merchant Payout ({100 - commissionRate}%):</span>
                        <span>{currency}{(child.amount - Math.round((child.amount * commissionRate) / 100))?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
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
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Financial Split Audit
              </h2>

              <div className="space-y-3 text-xs font-semibold">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Total Amount</span>
                    <span className="font-black text-slate-900">{currency}{totalRevenue?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600">
                    <span>{brandName} Platform Fee ({commissionRate}%)</span>
                    <span className="font-black">{currency}{platformFee?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-purple-600">
                    <span>Net Seller Payout ({100 - commissionRate}%)</span>
                    <span className="font-black">{currency}{sellerRevenue?.toLocaleString()}</span>
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
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Status Actions
              </h2>

              <div className="space-y-3">
                {order.status === "Cancelled" ? (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                      <p className="font-black text-red-900 text-xs">Order Cancelled</p>
                      <p className="text-[10px] text-red-700 font-semibold">Inventory restored to merchant stocks.</p>
                    </div>
                  </div>
                ) : (
                  <>
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

                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-xs text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                      >
                        Cancel Order (Override)
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status Timeline & Timestamps */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" /> Order Status Timestamps
              </h2>

              <div className="space-y-3 text-xs">
                {/* Placed Date & Time */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Placed Date &amp; Time</span>
                  <p className="font-extrabold text-slate-900">
                    {order.placedAt ? new Date(order.placedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                  </p>
                </div>

                {order.status === "Cancelled" ? (
                  <>
                    {/* Show Packed only if packed before cancel */}
                    {order.packedAt && (
                      <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                        <span className="text-[10px] font-extrabold text-purple-600 uppercase">Packed Date &amp; Time</span>
                        <p className="font-extrabold text-slate-900">
                          {new Date(order.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                        </p>
                      </div>
                    )}

                    {/* Show Shipped only if shipped before cancel */}
                    {order.shippedAt && (
                      <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase">Shipped Date &amp; Time</span>
                        <p className="font-extrabold text-slate-900">
                          {new Date(order.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                        </p>
                      </div>
                    )}

                    {/* Cancelled Date & Time (Highlighted in Red/Rose) */}
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Cancelled Date &amp; Time</span>
                        {order.cancelledBy && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
                            By {order.cancelledBy}
                          </span>
                        )}
                      </div>
                      <p className="font-black text-red-950 text-sm">
                        {order.cancelledAt
                          ? new Date(order.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : order.updatedAt
                          ? new Date(order.updatedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Order Cancelled"}
                      </p>
                      {order.cancellationReason && (
                        <p className="text-[11px] text-red-700 font-semibold pt-1 border-t border-red-100">
                          Reason: <span className="font-normal italic">"{order.cancellationReason}"</span>
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CANCEL ORDER ADMIN MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Admin Order Cancellation</h3>
                  <p className="text-xs text-slate-500">Provide executive audit reason to cancel #{order.parentOrderNumber}</p>
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
                  Select Administrative Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 outline-none transition"
                >
                  <option value="Fraudulent order or suspicious transaction">Fraudulent order or suspicious transaction</option>
                  <option value="Customer requested cancellation via executive support">Customer requested cancellation via executive support</option>
                  <option value="Merchant unable to fulfill inventory policy">Merchant unable to fulfill inventory policy</option>
                  <option value="Unserviceable delivery geography">Unserviceable delivery geography</option>
                  <option value="Payment gateway dispute / chargeback risk">Payment gateway dispute / chargeback risk</option>
                  <option value="Other">Other executive reason (specify below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Audit Notes / Reason Details {cancelReasonPreset === "Other" ? <span className="text-red-500">*</span> : "(Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={cancelReasonDetails}
                  onChange={(e) => setCancelReasonDetails(e.target.value)}
                  placeholder="Provide audit explanation for this cancellation override..."
                  required={cancelReasonPreset === "Other"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-rose-500 outline-none transition"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>This will cancel all merchant sub-packages, restore catalog stock, and record an immutable audit log.</span>
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
                  {cancelling ? "Cancelling..." : "Confirm Executive Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
