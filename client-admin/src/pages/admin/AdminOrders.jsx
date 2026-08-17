import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Eye, ShoppingBag, Package, Truck, CheckCircle2, Search } from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
    document.title = "Global Orders | ZyCart Admin";
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const filteredOrders = orders.filter((o) =>
    (o.parentOrderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              Global Order Audits ({orders.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Audit multi-seller child packages, platform commission cuts, and delivery status updates.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search Order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Orders Stack */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200/80 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-lg font-bold text-[#1B2A41]">No matching orders found</p>
            <p className="text-xs text-slate-500">Try clearing search filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-[#1B2A41]">
                        Order #{order.parentOrderNumber}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "Out for Delivery"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      Customer: <span className="font-bold text-slate-800">{order.user?.name || "Customer"}</span> ({order.user?.email}) • Placed: <span className="font-bold text-slate-800">{order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}</span> • Total: <span className="font-black text-slate-900">₹{order.totalAmount?.toLocaleString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="px-4 py-2.5 rounded-2xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-extrabold text-xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="w-4 h-4" /> Inspect Audit Details
                    </button>
                  </div>
                </div>

                {/* Sub Packages */}
                <div className="space-y-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Seller Packages ({order.childOrders?.length || 0})
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.childOrders?.map((child) => (
                      <div key={child._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs font-semibold">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-black text-[#1B2A41]">
                            Seller: {child.seller?.shopName || "Merchant"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                            {child.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {child.items?.map((item) => (
                            <div key={item.productId} className="flex justify-between text-slate-600">
                              <span className="truncate max-w-[220px]">{item.title} (₹{item.price?.toLocaleString()} × {item.qty})</span>
                              <span className="font-bold text-slate-900">₹{item.subtotal?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-slate-200/60 pt-2 flex justify-between font-black text-slate-900">
                          <span>Subtotal:</span>
                          <span>₹{child.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  {order.status === "Shipped" && (
                    <button
                      onClick={() => updateStatus(order._id, "Out for Delivery")}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-sm transition"
                    >
                      Mark Out for Delivery
                    </button>
                  )}

                  {order.status === "Out for Delivery" && (
                    <button
                      onClick={() => updateStatus(order._id, "Delivered")}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;
