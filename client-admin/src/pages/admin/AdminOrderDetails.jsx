import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    document.title = "Order Details | ZyCart Admin";
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

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">Order not found</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-[#3F51F4]"
          onClick={() => navigate("/admin/orders")}
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

  const totalRevenue = order?.totalAmount || 0;
  const platformFee = totalRevenue * 0.2;
  const sellerRevenue = totalRevenue * 0.8;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/admin/orders")}
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
        <div className="lg:col-span-2 space-y-6">
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

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Child Orders</h2>

            <div className="space-y-6">
              {order?.childOrders?.map((childOrder) => (
                <div key={childOrder._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#1B2A41]">
                        {childOrder.seller?.shopName}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Seller: {childOrder.seller?.email || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${getStatusColor(childOrder.status)}`}>
                      {childOrder.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {childOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.title} × {item.qty}</span>
                        <span className="font-semibold text-[#1B2A41]">
                          ₹{item.subtotal?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold text-[#1B2A41]">Subtotal:</span>
                    <span className="font-bold text-[#1B2A41]">
                      ₹{childOrder.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Delivery Address
            </h2>

            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-[#1B2A41] font-semibold text-lg">{order?.address?.line1}</p>
              <p className="text-gray-600 mt-2">
                {order?.address?.city}, {order?.address?.state} {order?.address?.postalCode}
              </p>
              <p className="text-gray-600 mt-2">
                Customer: {order?.user?.name} ({order?.user?.mobile})
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-[#1B2A41] mb-4">Actions</h3>

              <div className="space-y-3">
                {order?.status === "Shipped" && (
                  <button
                    onClick={() => updateOrderStatus("Out for Delivery")}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Mark Out for Delivery"}
                  </button>
                )}

                {order?.status === "Out for Delivery" && (
                  <button
                    onClick={() => updateOrderStatus("Delivered")}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    {updating ? "Updating..." : "Mark as Delivered"}
                  </button>
                )}

                {order?.status === "Delivered" && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-green-800 font-semibold">Order Delivered</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="border-t pt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Revenue Breakdown
              </h4>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-[#1B2A41]">
                    ₹{totalRevenue?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee (20%):</span>
                  <span className="font-bold text-green-600">
                    ₹{platformFee?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sellers (80%):</span>
                  <span className="font-bold text-blue-600">
                    ₹{sellerRevenue?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Child Orders:</span>
                  <span className="font-semibold text-[#1B2A41]">
                    {order?.childOrders?.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold text-[#1B2A41]">
                    {order?.childOrders?.reduce((sum, co) => sum + co.items.length, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">Customer</h4>
              <div className="space-y-2">
                <p className="text-[#1B2A41] font-semibold">
                  {order?.user?.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {order?.user?.email}
                </p>
                <p className="text-gray-600 text-sm">
                  {order?.user?.mobile}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
