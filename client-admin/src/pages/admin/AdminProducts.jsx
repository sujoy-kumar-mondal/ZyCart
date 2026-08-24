import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  Store,
  Tag,
  Boxes,
  ExternalLink,
  Layers,
  X,
  RefreshCw,
  Clock,
  ShieldAlert,
  Percent
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../../context/SettingsProvider";

const AdminProducts = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    outOfStock: 0,
    lowStock: 0,
    totalSellers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedAvailability !== "all") params.availability = selectedAvailability;
      if (selectedStockStatus !== "all") params.stockStatus = selectedStockStatus;

      const res = await axios.get("/admin/products", { params });
      if (res.data.success) {
        setProducts(res.data.products || []);
        setStats(res.data.stats || { total: 0, live: 0, outOfStock: 0, lowStock: 0, totalSellers: 0 });
        setCategoriesList(res.data.categories || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `Manage Products | ${brandName} Admin`;
    fetchProducts();
  }, [selectedCategory, selectedAvailability, selectedStockStatus, brandName]);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleOpenDetailModal = (prod) => {
    setSelectedProduct(prod);
    setShowDetailModal(true);
  };

  const handleOpenDeleteModal = (prod) => {
    setSelectedProduct(prod);
    setShowDeleteModal(true);
  };

  const handleToggleAvailability = async (prod) => {
    try {
      const newStatus = !prod.isAvailable;
      const res = await axios.patch(`/admin/products/status/${prod._id}`, {
        isAvailable: newStatus,
      });
      if (res.data.success) {
        toast.success(res.data.message || `Product status updated!`);
        setProducts((prev) =>
          prev.map((p) => (p._id === prod._id ? { ...p, isAvailable: newStatus } : p))
        );
        if (selectedProduct && selectedProduct._id === prod._id) {
          setSelectedProduct((prev) => ({ ...prev, isAvailable: newStatus }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product status");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      const res = await axios.delete(`/admin/products/${selectedProduct._id}`);
      if (res.data.success) {
        toast.success("Product removed from platform catalog!");
        setShowDeleteModal(false);
        setShowDetailModal(false);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  const isDiscountActive = (prod) => {
    if (!prod.discount || prod.discount <= 0) return false;
    if (!prod.discountPeriod) return true;
    return new Date(prod.discountPeriod) > new Date();
  };

  const getEffectivePrice = (prod) => {
    if (isDiscountActive(prod)) {
      const disc = prod.discountedPrice || prod.price - (prod.price * prod.discount) / 100;
      return Math.round(disc);
    }
    return prod.price;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-black via-slate-900 to-[#BE123C] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Package className="w-3.5 h-3.5 text-rose-400" /> Platform Catalog Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Manage Merchant Products
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Inspect, moderate, audit stock levels, and control catalog visibility for all product listings across registered merchants.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={fetchProducts}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-rose-600" /> Refresh Catalog
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
              <Package className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Catalog total entries</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Live & Active</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.live}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Visible to customers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-600">{stats.outOfStock}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Inventory depleted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Selling Merchants</span>
              <Store className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-600">{stats.totalSellers}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Stores with active items</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search product, seller, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-rose-500 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Visibility:</span>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
              >
                <option value="all">All Visibility</option>
                <option value="available">Live on Store</option>
                <option value="unavailable">Restricted / Hidden</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Stock:</span>
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
              >
                <option value="all">All Stock</option>
                <option value="in_stock">In Stock (&gt; 5)</option>
                <option value="low_stock">Low Stock (1-5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader />
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-800">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No catalog items match your search or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-6">Merchant Store</th>
                    <th className="py-4 px-6">Category Hierarchy</th>
                    <th className="py-4 px-6 text-center">Pricing</th>
                    <th className="py-4 px-6 text-center">Stock</th>
                    <th className="py-4 px-6 text-center">Store Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                  {products.map((prod) => {
                    const effectivePrice = getEffectivePrice(prod);
                    const hasDiscount = isDiscountActive(prod);

                    return (
                      <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors group">
                        
                        {/* Product Thumbnail & Title */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.images && prod.images.length > 0 ? (
                                <img
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="space-y-0.5 max-w-xs">
                              <p className="font-extrabold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition">
                                {prod.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                ID: #{prod._id.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Seller */}
                        <td className="py-4 px-6">
                          {prod.seller ? (
                            <Link
                              to={`/admin/sellers/${prod.seller._id}`}
                              className="group/seller flex flex-col"
                            >
                              <span className="font-bold text-slate-900 group-hover/seller:text-rose-600 transition flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-slate-400" />
                                {prod.seller.shopName || prod.seller.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {prod.seller.email}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">Unknown Store</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">
                              {prod.mainCategory}
                            </span>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {prod.subCategory} &gt; {prod.subSubCategory}
                            </p>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-4 px-6 text-center">
                          <div className="space-y-0.5">
                            <p className="font-black text-slate-900 text-sm">
                              {currency}{effectivePrice.toLocaleString()}
                            </p>
                            {hasDiscount && (
                              <div className="flex items-center justify-center gap-1">
                                <span className="line-through text-slate-400 text-[10px]">
                                  {currency}{prod.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  -{prod.discount}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                              prod.stock === 0
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : prod.stock <= 5
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <Boxes className="w-3 h-3" />
                            {prod.stock} units
                          </span>
                        </td>

                        {/* Store Availability Status */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleAvailability(prod)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                              prod.isAvailable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {prod.isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-500" /> Restricted
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenDetailModal(prod)}
                            title="Inspect Product"
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(prod)}
                            title="Delete Product"
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* PRODUCT DETAILS INSPECTION MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showDetailModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Catalog Product Inspection</h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      ID: #{selectedProduct._id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Gallery Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Product Imagery Gallery ({selectedProduct.images.length})
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {selectedProduct.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden"
                      >
                        <img src={img} alt={`Product view ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-black text-base text-slate-900">{selectedProduct.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedProduct.description || "No written description provided by merchant."}
                </p>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">MRP Base Price</span>
                  <p className="font-black text-slate-900 text-sm">{currency}{selectedProduct.price?.toLocaleString()}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Active Discount</span>
                  <p className="font-black text-emerald-600 text-sm">
                    {selectedProduct.discount > 0 ? `${selectedProduct.discount}% OFF` : "None"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Selling Price</span>
                  <p className="font-black text-rose-600 text-sm">
                    {currency}{getEffectivePrice(selectedProduct).toLocaleString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Stock Inventory</span>
                  <p className="font-black text-slate-900 text-sm">{selectedProduct.stock} units</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Max Per Order</span>
                  <p className="font-black text-slate-900 text-sm">
                    {selectedProduct.maxQuantityPerPurchase || 1} units
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Store Status</span>
                  <p className={`font-black text-sm ${selectedProduct.isAvailable ? "text-emerald-600" : "text-red-600"}`}>
                    {selectedProduct.isAvailable ? "Live & Active" : "Restricted"}
                  </p>
                </div>
              </div>

              {/* Seller Information */}
              {selectedProduct.seller && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                      Listing Merchant Store
                    </span>
                    <p className="font-extrabold text-sm text-slate-900">
                      {selectedProduct.seller.shopName || selectedProduct.seller.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{selectedProduct.seller.email}</p>
                  </div>

                  <Link
                    to={`/admin/sellers/${selectedProduct.seller._id}`}
                    className="px-3.5 py-2 rounded-xl bg-white text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-50 transition flex items-center gap-1.5 shadow-xs"
                  >
                    View Merchant <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Dynamic Category Attributes */}
              {selectedProduct.attributes && Object.keys(selectedProduct.attributes).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Category Specifications & Attributes
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.entries(selectedProduct.attributes).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{key}</span>
                        <span className="text-xs font-bold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(selectedProduct)}
                  className={`w-1/2 py-3 rounded-2xl font-black text-xs transition cursor-pointer ${
                    selectedProduct.isAvailable
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
                  }`}
                >
                  {selectedProduct.isAvailable ? "Restrict Listing (Hide from Store)" : "Make Listing Live"}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(selectedProduct)}
                  className="w-1/2 py-3 rounded-2xl font-black text-white text-xs bg-red-600 hover:bg-red-700 shadow-md hover:shadow-red-500/20 transition cursor-pointer"
                >
                  Delete Listing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showDeleteModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Delete Product Listing?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-slate-800">"{selectedProduct.title}"</span> from the catalog?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-1/2 py-3 rounded-2xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  className="w-1/2 py-3 rounded-2xl font-black text-white text-xs bg-red-600 hover:bg-red-700 shadow-md hover:shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminProducts;
