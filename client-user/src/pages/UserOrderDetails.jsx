import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const UserOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    document.title = "Order Details | ZyCart";
  }, [orderId]);

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
      <div className="flex items-center gap-3 mb-8">
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
                  <Calendar className="w-4 h-4" /> Order Date
                </p>
                <p className="text-[#1B2A41] font-semibold">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
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
                      <p className="text-gray-600 text-sm">Price: ₹{item.price?.toLocaleString()}</p>
                      <p className="text-[#1B2A41] font-bold mt-2">
                        Subtotal: ₹{item.subtotal?.toLocaleString()}
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
                      ₹{item.subtotal?.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-[#1B2A41]">
                  ₹{order?.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-[#1B2A41]">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-[#1B2A41]">Total:</span>
                <span className="text-2xl font-bold text-[#3F51F4]">
                  ₹{order?.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-8 pt-8 border-t">
              <h4 className="font-bold text-[#1B2A41] mb-4">Timeline</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1B2A41] text-sm">Order Placed</p>
                    <p className="text-gray-600 text-xs">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                </div>

                {order?.status !== "Pending" && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Confirmed</p>
                      <p className="text-gray-600 text-xs">Payment received</p>
                    </div>
                  </div>
                )}

                {["Shipped", "Out for Delivery", "Delivered"].includes(order?.status) && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Shipped</p>
                      <p className="text-gray-600 text-xs">On the way to you</p>
                    </div>
                  </div>
                )}

                {order?.status === "Delivered" && (
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#1B2A41] text-sm">Delivered</p>
                      <p className="text-gray-600 text-xs">Successfully delivered</p>
                    </div>
                  </div>
                )}

                {!["Delivered"].includes(order?.status) && (
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-400 text-sm">Delivery</p>
                      <p className="text-gray-400 text-xs">Coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
