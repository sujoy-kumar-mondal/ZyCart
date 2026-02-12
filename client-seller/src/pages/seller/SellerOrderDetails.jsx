import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Calendar, MapPin, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const SellerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    document.title = "Order Details | ZyCart Seller";
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/seller/orders/${orderId}`);
      setOrder(res.data.order);
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
      toast.success("Order status updated successfully!");
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">Order not found</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-[#3F51F4]"
          onClick={() => navigate("/seller/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      Confirmed: "bg-blue-100 text-blue-800",
      Packed: "bg-purple-100 text-purple-800",
      Shipped: "bg-green-100 text-green-800",
      "Out for Delivery": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-200 text-green-900",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/seller/orders")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1B2A41]">Order Details</h1>
          <p className="text-gray-600">Parent Order #{order?.parentOrderId?.parentOrderNumber}</p>
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
                <p className="text-gray-600 text-sm mb-1">Your Earning</p>
                <p className="text-[#1B2A41] font-bold text-lg">
                  ₹{(order?.amount * 0.8)?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Order Date
                </p>
                <p className="text-[#1B2A41] font-semibold">
                  {order?.parentOrderId?.createdAt ? new Date(order.parentOrderId.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-1">Order Total</p>
                <p className="text-[#1B2A41] font-semibold">
                  ₹{order?.amount?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Items</h2>

            <div className="space-y-4">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1B2A41] text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">Quantity: {item.qty}</p>
                    <p className="text-gray-600 text-sm">Price: ₹{item.price?.toLocaleString()}</p>
                    <p className="text-[#1B2A41] font-bold mt-2">
                      Subtotal: ₹{item.subtotal?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Address */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Delivery Address
            </h2>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-[#1B2A41] font-semibold text-lg">
                {order?.parentOrderId?.address?.line1}
              </p>
              <p className="text-gray-600 mt-2">
                {order?.parentOrderId?.address?.city}, {order?.parentOrderId?.address?.state}{" "}
                {order?.parentOrderId?.address?.postalCode}
              </p>
              <p className="text-gray-600 mt-2">
                Phone: {order?.userId?.mobile || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Order Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Actions</h3>

            <div className="space-y-3 mb-6">
              {order?.status !== "Shipped" && (
                <>
                  {order?.status === "Confirmed" && (
                    <button
                      onClick={() => updateOrderStatus("Packed")}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Mark as Packed"}
                    </button>
                  )}

                  <button
                    onClick={() => updateOrderStatus("Shipped")}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-[#3F51F4] text-white rounded-lg hover:bg-[#2F3FA8] transition font-semibold disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Mark as Shipped"}
                  </button>
                </>
              )}

              {order?.status === "Shipped" && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-green-800 font-semibold">Order Shipped</p>
                  <p className="text-green-700 text-sm mt-1">
                    Package is on its way to customer
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">Summary</h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-[#1B2A41]">
                    ₹{order?.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Your Cut (80%):</span>
                  <span className="font-semibold text-[#1B2A41]">
                    ₹{(order?.amount * 0.8)?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Platform Fee (20%):</span>
                  <span className="font-semibold text-gray-500">
                    ₹{(order?.amount * 0.2)?.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-[#1B2A41]">Your Earning:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{(order?.amount * 0.8)?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="border-t mt-6 pt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">Customer</h4>
              <div className="space-y-2">
                <p className="text-[#1B2A41] font-semibold">
                  {order?.userId?.name || 'N/A'}
                </p>
                <p className="text-gray-600 text-sm">
                  {order?.userId?.email || 'N/A'}
                </p>
                <p className="text-gray-600 text-sm">
                  {order?.userId?.mobile || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetails;
