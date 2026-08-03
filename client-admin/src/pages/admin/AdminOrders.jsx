import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH ALL PARENT ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get("/admin/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE PARENT ORDER STATUS
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`/admin/orders/status/${id}`, { status: newStatus });
      toast.success("Order status updated!");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    document.title = "Orders | ZyCart";
  }, []);

  if (loading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 text-center py-20 text-gray-500">
        No orders found.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-10 py-10">

      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
          mb-4
        "
      >
        Manage Orders
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="
            p-7 rounded-2xl shadow-lg
            bg-white/60 backdrop-blur-xl
            border border-[#8FD6F6]/40
            space-y-6
          "
        >

          {/* Parent Header */}
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="text-gray-600 text-sm">Order Number</p>
              <h3 className="font-semibold text-[#1B2A41]">
                {order.parentOrderNumber}
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`
                  px-3 py-1 rounded-lg text-sm text-white font-medium
                  ${order.status === "Delivered"
                    ? "bg-linear-to-r from-green-400 to-green-600"
                    : order.status === "Out for Delivery"
                      ? "bg-linear-to-r from-orange-400 to-orange-600"
                      : order.status === "Shipped"
                        ? "bg-linear-to-r from-blue-400 to-blue-600"
                        : "bg-gray-600"
                  }
                `}
              >
                {order.status}
              </span>

              <button
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3F51F4] text-white rounded-lg hover:bg-[#2F3FA8] transition"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>

          {/* Child Orders */}
          <div className="space-y-4">
            {order.childOrders.map((child) => (
              <div
                key={child._id}
                className="
                  border p-4 rounded-xl
                  bg-white/50 backdrop-blur
                  border-[#8FD6F6]/30
                "
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-[#1B2A41]">
                    Seller: {child.seller?.shopName || "Seller"}
                  </h4>

                  <span
                    className={`
                      px-3 py-1 rounded-lg text-white text-xs font-medium
                      ${child.status === "Shipped"
                        ? "bg-linear-to-r from-blue-400 to-blue-600"
                        : child.status === "Packed"
                          ? "bg-linear-to-r from-purple-400 to-purple-600"
                          : "bg-gray-600"
                      }
                    `}
                  >
                    {child.status}
                  </span>
                </div>

                {/* Items */}
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  {child.items.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>
                        {item.title} × {item.qty}
                      </span>
                      <span className="font-semibold text-[#1B2A41]">
                        ₹{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-right mt-2 font-semibold text-[#1B2A41]">
                  Subtotal: ₹{child.amount}
                </div>
              </div>
            ))}
          </div>

          {/* Status Actions */}
          <div className="flex gap-4 justify-end">
            {order.status === "Shipped" && (
              <button
                onClick={() => updateStatus(order._id, "Out for Delivery")}
                className="
                  px-4 py-2 rounded-xl text-white font-semibold
                  bg-linear-to-r from-orange-400 to-orange-600
                  hover:opacity-90 transition
                "
              >
                Mark Out for Delivery
              </button>
            )}

            {order.status === "Out for Delivery" && (
              <button
                onClick={() => updateStatus(order._id, "Delivered")}
                className="
                  px-4 py-2 rounded-xl text-white font-semibold
                  bg-linear-to-r from-green-400 to-green-600
                  hover:opacity-90 transition
                "
              >
                Mark Delivered
              </button>
            )}
          </div>

        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
