import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { useSettings } from "../context/SettingsProvider";
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle, Clock, XCircle, AlertTriangle, X } from "lucide-react";
import toast from "react-hot-toast";

const UserOrderDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Order placed by mistake");
  const [cancelReasonDetails, setCancelReasonDetails] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    document.title = `Order Details | ${brandName}`;
  }, [orderId, brandName]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load order");
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  };

  const canCancel = order && !["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(order.status);

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
      const res = await axios.post(`/orders/${orderId}/cancel`, { reason: finalReason });
      toast.success(res.data.message || "Order cancelled successfully!");
      setShowCancelModal(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">Order not found</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-blue-600"
          onClick={() => navigate("/my-orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-blue-100 text-blue-800",
      Shipped: "bg-purple-100 text-purple-800",
      "Out for Delivery": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1B2A41]">Order Details</h1>
            <p className="text-gray-600">Order #{order?.parentOrderNumber}</p>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-sm transition flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" /> Cancel Order
          </button>
        )}
      </div>

      {/* Cancellation Notice Banner */}
      {order?.status === "Cancelled" && (
        <div className="p-6 mb-8 bg-red-50 border-2 border-red-200 rounded-3xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center font-bold shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-red-950 text-base">
                Order Cancelled {order.cancelledBy ? `by ${order.cancelledBy === "User" ? "Customer (You)" : order.cancelledBy === "Seller" ? "Merchant / Seller" : "Platform Administration"}` : ""}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Order Status</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">Order Status</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${getStatusColor(order?.status)}`}>
                  {order?.status}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">Payment Status</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${getPaymentStatusColor(order?.paymentStatus)}`}>
                  {order?.paymentStatus?.charAt(0).toUpperCase() + order?.paymentStatus?.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Order Date &amp; Time
                </p>
                <p className="text-[#1B2A41] font-semibold">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">Payment Method</p>
                <p className="text-[#1B2A41] font-semibold capitalize">
                  {order?.paymentMethod || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Order Items</h2>

            <div className="space-y-4">
              {order?.childOrders?.map((childOrder) =>
                childOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1B2A41] text-lg">{item.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">Quantity: {item.qty}</p>
                      <p className="text-gray-600 text-sm">Price: {currency}{item.price?.toLocaleString()}</p>
                      <p className="text-[#1B2A41] font-bold mt-2">
                        Subtotal: {currency}{item.subtotal?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(childOrder.status)}`}>
                        {childOrder.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Delivery Address
            </h2>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-[#1B2A41] font-semibold text-lg">{order?.address?.line1}</p>
              <p className="text-gray-600 mt-2">
                {order?.address?.city}, {order?.address?.state} {order?.address?.postalCode}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Order Summary</h3>

            <div className="space-y-4 border-b border-gray-200 pb-4 mb-4">
              {order?.childOrders?.map((childOrder) =>
                childOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.title} x{item.qty}</span>
                    <span className="font-semibold text-[#1B2A41]">
                      {currency}{item.subtotal?.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-[#1B2A41]">
                  {currency}{order?.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-[#1B2A41]">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-[#1B2A41]">Total:</span>
                <span className="text-2xl font-bold text-[#3F51F4]">
                  {currency}{order?.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-bold text-[#1B2A41] mb-4">Order Tracking Timeline</h4>
              <div className="space-y-4">
                
                {/* Placed */}
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1B2A41] text-sm">Order Placed</p>
                    <p className="text-gray-600 text-xs">
                      {order?.placedAt
                        ? new Date(order.placedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                        : order?.createdAt
                        ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Confirmed */}
                {order?.status !== "Pending" && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Confirmed</p>
                      <p className="text-gray-600 text-xs">
                        {order?.confirmedAt
                          ? new Date(order.confirmedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Payment & Order Confirmed"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Packed */}
                {(order?.packedAt || ["Packed", "Shipped", "Out for Delivery", "Delivered"].includes(order?.status)) && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Items Packed</p>
                      <p className="text-gray-600 text-xs">
                        {order?.packedAt
                          ? new Date(order.packedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Packed & Verified by Seller"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Shipped */}
                {(order?.shippedAt || ["Shipped", "Out for Delivery", "Delivered"].includes(order?.status)) && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Shipped</p>
                      <p className="text-gray-600 text-xs">
                        {order?.shippedAt
                          ? new Date(order.shippedAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "On the way to logistics center"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Out for Delivery */}
                {(order?.outForDeliveryAt || ["Out for Delivery", "Delivered"].includes(order?.status)) && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Out for Delivery</p>
                      <p className="text-gray-600 text-xs">
                        {order?.outForDeliveryAt
                          ? new Date(order.outForDeliveryAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Courier agent out for delivery"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivered */}
                {(order?.deliveredAt || order?.status === "Delivered") && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Delivered</p>
                      <p className="text-gray-600 text-xs">
                        {order?.deliveredAt
                          ? new Date(order.deliveredAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Successfully delivered"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {order?.status === "Cancelled" && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-600 text-sm">Cancelled</p>
                      <p className="text-gray-600 text-xs">
                        {order?.cancelledAt
                          ? new Date(order.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "Order cancelled"}
                      </p>
                    </div>
                  </div>
                )}

                {!["Delivered", "Cancelled"].includes(order?.status) && (
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-400 text-sm">Delivery Status</p>
                      <p className="text-gray-400 text-xs">In transit</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL ORDER MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#1B2A41]">Cancel Order</h3>
                  <p className="text-xs text-slate-500">Please provide a reason to cancel #{order?.parentOrderNumber}</p>
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
                  Select Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                >
                  <option value="Order placed by mistake">Order placed by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Need to change shipping address">Need to change shipping address</option>
                  <option value="Delivery timeline is too long">Delivery timeline is too long</option>
                  <option value="Purchased alternative product">Purchased alternative product</option>
                  <option value="Other">Other reason (specify below)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Additional Details {cancelReasonPreset === "Other" ? <span className="text-red-500">*</span> : "(Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={cancelReasonDetails}
                  onChange={(e) => setCancelReasonDetails(e.target.value)}
                  placeholder="Explain why you wish to cancel this order..."
                  required={cancelReasonPreset === "Other"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Cancelling will stop package processing immediately and restore merchant inventory.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-6 py-3 rounded-2xl font-extrabold text-sm text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
