import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye } from "lucide-react";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH SELLER ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get("/seller/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const updateStatus = async (childOrderId, newStatus) => {
    try {
      await axios.patch(`/seller/orders/status/${childOrderId}`, {
        status: newStatus,
      });

      alert("Order updated successfully!");
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update order");
    }
  };

  useEffect(() => {
    document.title = "Orders | ZyCart";
  }, []);

  if (loading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 text-center text-gray-500 py-20 text-lg">
        No orders found.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-10">

      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
        "
      >
        Manage Orders
      </h1>

      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order._id}
            className="
              p-7 rounded-2xl shadow-md
              bg-white/60 border border-[#8FD6F6]/40
              backdrop-blur-xl
            "
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="text-gray-600 text-sm">Parent Order</p>
                <h3 className="font-semibold text-[#1B2A41]">
                  {order.parentOrderId?.parentOrderNumber}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`
                    px-3 py-1 rounded-lg text-white text-sm font-medium
                    ${order.status === "Shipped"
                      ? "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]"
                      : order.status === "Packed"
                        ? "bg-linear-to-r from-purple-400 to-purple-600"
                        : "bg-gray-500"
                    }
                  `}
                >
                  {order.status}
                </span>

                <button
                  onClick={() => navigate(`/seller/orders/${order._id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3F51F4] text-white rounded-lg hover:bg-[#2F3FA8] transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4 space-y-2 text-gray-700">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.title} × {item.qty}
                  </span>
                  <span className="font-semibold">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="text-right mt-2 font-semibold text-[#1B2A41]">
              Subtotal: ₹{order.amount}
            </div>

            {/* Status Actions */}
            {order.status !== "Shipped" && (
              <div className="flex gap-4 mt-5">

                {order.status === "Confirmed" && (
                  <button
                    onClick={() => updateStatus(order._id, "Packed")}
                    className="
                      px-4 py-2 rounded-xl font-semibold text-white
                      bg-linear-to-r from-purple-400 to-purple-600
                      hover:opacity-90 transition
                    "
                  >
                    Mark as Packed
                  </button>
                )}

                <button
                  onClick={() => updateStatus(order._id, "Shipped")}
                  className="
                    px-4 py-2 rounded-xl font-semibold text-white
                    bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                    hover:opacity-90 transition
                  "
                >
                  Mark as Shipped
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerOrders;
