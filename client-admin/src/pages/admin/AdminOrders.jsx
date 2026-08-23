import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import {
  Eye,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  ChevronDown,
  ArrowUpDown,
  Filter,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminOrders = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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
      toast.success(`Order marked as ${newStatus}!`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  useEffect(() => {
    document.title = `Global Orders | ${brandName} Admin`;
  }, [brandName]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const inTransit = orders.filter((o) =>
      ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery"].includes(o.status)
    ).length;
    const cancelled = orders.filter((o) => o.status === "Cancelled").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.totalAmount || 0 : 0), 0);

    return { total, delivered, inTransit, cancelled, totalRevenue };
  }, [orders]);

  // Filter & Sort
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch =
          (o.parentOrderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || o.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === "highest") {
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        }
        if (sortBy === "lowest") {
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        }
        return 0;
      });
  }, [orders, searchTerm, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner matching AdminProducts */}
        <div className="bg-gradient-to-r from-[#1B2A41] via-[#243B5A] to-[#3F51F4] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <TrendingUp className="w-3.5 h-3.5 text-blue-300" /> Platform Order Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Global Order Audits
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Audit multi-seller child packages, platform commission cuts, track package lifecycles, and execute cancellation overrides.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={fetchOrders}
              className="px-5 py-3 rounded-2xl bg-white text-[#1B2A41] font-black text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#3F51F4]" /> Refresh Orders
            </button>
          </div>
        </div>

        {/* 4 Core Metrics Grid matching AdminProducts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#3F51F4]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold">All customer checkouts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Fulfilled &amp; Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.delivered}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Delivered to shoppers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">In Transit / Active</span>
              <Truck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-600">{stats.inTransit}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Processing &amp; on the way</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Cancelled Orders</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-600">{stats.cancelled}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Refunded or voided</p>
          </div>
        </div>

        {/* Search & Filter Bar matching AdminProducts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search Order #, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2 px-3 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none cursor-pointer"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2 px-3 focus:ring-2 focus:ring-[#3F51F4]/40 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Stack */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="text-lg font-black text-[#1B2A41]">No matching orders found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              We couldn't find any orders matching your active filters. Try modifying your search query or status selection.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6 hover:border-slate-300 transition duration-150"
              >
                {/* Header Strip */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-black text-[#1B2A41] tracking-tight">
                        Order #{order.parentOrderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : order.status === "Out for Delivery"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : order.status === "Cancelled"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-purple-100 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        Customer: <strong className="text-slate-900 font-bold">{order.user?.name || "Customer"}</strong> ({order.user?.email})
                      </span>
                      <span>•</span>
                      <span>
                        Placed: <strong className="text-slate-900 font-bold">{order.createdAt ? new Date(order.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" }) : "N/A"}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Total Value: <strong className="text-slate-900 font-black">{currency}{order.totalAmount?.toLocaleString()}</strong>
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="px-5 py-2.5 rounded-2xl bg-blue-50 text-[#3F51F4] hover:bg-blue-100 font-black text-xs transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
                    >
                      <Eye className="w-4 h-4" /> Inspect Audit Details
                    </button>
                  </div>
                </div>

                {/* Cancelled Notice Banner */}
                {order.status === "Cancelled" && (
                  <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="font-black text-red-800">
                        Order Cancelled by {order.cancelledBy === "Admin" ? "Platform Administrator" : order.cancelledBy === "User" ? "Customer" : "Merchant / Seller"}:
                      </span>
                      {order.cancellationReason && (
                        <p className="text-red-700 italic font-medium">
                          "{order.cancellationReason}"
                        </p>
                      )}
                    </div>
                    {order.cancelledAt && (
                      <span className="text-[11px] text-red-600 font-black shrink-0 px-2.5 py-1 rounded-xl bg-red-100/60 border border-red-200">
                        {new Date(order.cancelledAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
                      </span>
                    )}
                  </div>
                )}

                {/* Sub Packages Breakdown */}
                <div className="space-y-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> Seller Packages ({order.childOrders?.length || 0})
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.childOrders?.map((child) => (
                      <div
                        key={child._id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                          <span className="font-black text-[#1B2A41] truncate max-w-[200px]">
                            {child.seller?.shopName || "Merchant Store"}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            child.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : child.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {child.status}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {child.items?.map((item) => (
                            <div key={item.productId} className="flex justify-between text-slate-600 font-medium">
                              <span className="truncate max-w-[240px]">
                                {item.title} ({currency}{item.price?.toLocaleString()} × {item.qty})
                              </span>
                              <span className="font-bold text-slate-900 shrink-0">
                                {currency}{item.subtotal?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-slate-200/60 pt-2 flex justify-between font-black text-slate-900">
                          <span>Package Total:</span>
                          <span className="text-[#3F51F4]">{currency}{child.amount?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Advancement Actions */}
                {(order.status === "Shipped" || order.status === "Out for Delivery") && (
                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                    {order.status === "Shipped" && (
                      <button
                        onClick={() => updateStatus(order._id, "Out for Delivery")}
                        className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        Mark Out for Delivery
                      </button>
                    )}

                    {order.status === "Out for Delivery" && (
                      <button
                        onClick={() => updateStatus(order._id, "Delivered")}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;
