import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Loader from "../components/Loader";
import { Eye } from "lucide-react";

const UserOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH USER ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders/my-orders");
      setOrders(res.data.orders || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    document.title = "Orders | ZyCart";
  }, []);

  if (loading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="text-center text-gray-600 py-20 text-lg">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-12 space-y-10">

      <h1 className="text-3xl font-extrabold text-[#1B2A41]">
        My Orders
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="
            bg-white rounded-2xl p-6 shadow-xl
            border border-[#8FD6F6]/40
            space-y-6
          "
        >
          {/* Parent Order Header */}
          <div className="flex justify-between items-center border-b pb-4">

            <div>
              <p className="text-gray-600 text-sm">Order Number</p>
              <h3 className="font-semibold text-[#1B2A41] text-lg">
                {order.parentOrderNumber}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-gray-600 text-sm">Order Status</p>

                <span
                  className={`
                    px-3 py-1 rounded-lg text-white text-sm 
                    ${order.status === "Delivered"
                      ? "bg-green-600"
                      : order.status === "Out for Delivery"
                        ? "bg-orange-500"
                        : order.status === "Shipped"
                          ? "bg-[#3F51F4]"
                          : "bg-gray-600"
                    }
                  `}
                >
                  {order.status}
                </span>
              </div>

              <button
                onClick={() => navigate(`/my-orders/${order._id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3F51F4] text-white rounded-lg hover:bg-[#2F3FA8] transition"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>

          {/* Child Orders */}
          <div className="space-y-5">
            {order.childOrders.map((child) => (
              <div
                key={child._id}
                className="
                  bg-[#F7FBFF] border border-[#8FD6F6]/40 p-5 rounded-xl
                  shadow-sm
                "
              >

                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-[#1B2A41]">
                    Seller: {child.seller?.shopName || "Unknown Seller"}
                  </h4>

                  <span
                    className={`
                      px-3 py-1 rounded-lg text-white text-xs
                      ${child.status === "Shipped"
                        ? "bg-[#3F51F4]"
                        : child.status === "Packed"
                          ? "bg-[#6A8EF0]"
                          : "bg-gray-600"
                      }
                    `}
                  >
                    {child.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 text-sm text-gray-700">
                  {child.items.map((item) => (
                    <div
                      key={item.productId?._id || item.productId}
                      className="flex justify-between"
                    >
                      <span>
                        {item.title} × {item.qty}
                      </span>
                      <span className="font-semibold text-[#1B2A41]">
                        ₹{item.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="text-right font-semibold text-[#1B2A41] mt-2">
                  Subtotal: ₹{child.amount}
                </div>

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
