import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, Store, ShieldCheck, Ban, X, Eye, Package, Tag, Layers, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const AdminSellerDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInspectModal, setShowInspectModal] = useState(false);

  useEffect(() => {
    fetchSellerDetails();
    document.title = `Merchant Verification | ${brandName} Admin`;
  }, [sellerId, brandName]);

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/sellers/${sellerId}`);
      setSeller(res.data.seller);
      setProducts(res.data.seller.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load seller");
      navigate("/admin/sellers");
    } finally {
      setLoading(false);
    }
  };

  const toggleApprovalStatus = async () => {
    try {
      setActionLoading(true);
      const endpoint = seller.isApproved
        ? `/admin/sellers/${sellerId}/approve`
        : `/admin/sellers/approve/${sellerId}`;
      await axios.patch(endpoint);
      toast.success(seller.isApproved ? "Seller approval revoked!" : "Seller approved successfully!");
      fetchSellerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update seller approval");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleBanStatus = async () => {
    try {
      setActionLoading(true);
      const endpoint = seller.isBanned ? `/admin/sellers/unban/${sellerId}` : `/admin/sellers/ban/${sellerId}`;
      await axios.patch(endpoint);
      toast.success(seller.isBanned ? "Seller unbanned successfully!" : "Seller banned successfully!");
      fetchSellerDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update seller status");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!seller) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/sellers")}
              className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
                  {seller.shopName || seller.name}
                </h1>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${seller.isBanned ? "bg-red-100 text-red-800" : seller.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                  {seller.isBanned ? "Banned" : seller.isApproved ? "Approved Merchant" : "Pending Approval"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Merchant Store ID: <span className="font-mono text-slate-700">{seller._id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">

            {/* Merchant Owner Profile */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Storefront &amp; Owner Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Shop Name</span>
                  <p className="font-black text-sm text-slate-900">{seller.shopName || "N/A"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Owner Name</span>
                  <p className="font-black text-sm text-slate-900">{seller.name || "N/A"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Category</span>
                  <p className="font-black text-sm text-slate-900">{seller.shopType || "General"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Registration Date</span>
                  <p className="font-black text-sm text-slate-900">
                    {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</span>
                  <p className="font-black text-sm text-slate-900">{seller.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Mobile Phone</span>
                  <p className="font-black text-sm text-slate-900">{seller.mobile || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Business Credentials */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Business &amp; Tax Verification Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">GSTIN Number</span>
                  <p className="font-mono font-black text-sm text-slate-900 uppercase">{seller.gst || "Not provided"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">PAN Number</span>
                  <p className="font-mono font-black text-sm text-slate-900 uppercase">{seller.pan || "Not provided"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Aadhaar Number</span>
                  <p className="font-mono font-black text-sm text-slate-900">
                    {seller.aadhar ? `**** **** ${seller.aadhar.slice(-4)}` : "Not provided"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Bank Account</span>
                  <p className="font-mono font-black text-sm text-slate-900">{seller.bankAccount || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Listed Catalog Items ({products.length})
              </h2>

              {products.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400 py-4 text-center">No products listed by this seller yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-800">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3 whitespace-nowrap">Product</th>
                        <th className="px-4 py-3 whitespace-nowrap">MRP Price</th>
                        <th className="px-4 py-3 whitespace-nowrap">Selling Price</th>
                        <th className="px-4 py-3 whitespace-nowrap">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.slice(0, 10).map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50/60 transition group">
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setSelectedImage(0);
                                setShowInspectModal(true);
                              }}
                              className="flex items-center gap-3 text-left w-full hover:opacity-90 transition group/btn"
                            >
                              <img
                                src={product.images?.[0] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product"}
                                alt={product.title}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 group-hover/btn:scale-105 transition"
                              />
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 group-hover/btn:text-[#3F51F4] transition line-clamp-1 max-w-xs">
                                  {product.title}
                                </p>
                                {product.mainCategory && (
                                  <p className="text-[10px] text-slate-400 font-medium truncate">
                                    {product.mainCategory} {product.subCategory ? `> ${product.subCategory}` : ''}
                                  </p>
                                )}
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-3 font-black">{currency}{product.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              const isExpired = product.discountPeriod && new Date(product.discountPeriod) <= new Date();
                              const sellingPrice = (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price)
                                ? product.discountedPrice
                                : (product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)) : product.price);

                              const discountPct = product.discount > 0
                                ? product.discount
                                : (product.discountedPrice && product.discountedPrice < product.price
                                  ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
                                  : 0);

                              const isDiscountActive = !isExpired && discountPct > 0 && sellingPrice < product.price;

                              if (isDiscountActive) {
                                return (
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="font-black text-emerald-600">
                                      {currency}{sellingPrice.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                      {discountPct}% OFF
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <span className="font-black text-slate-900">
                                  {currency}{product.price?.toLocaleString()}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 font-black">{product.stock} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                Account Controls
              </h2>

              <div className="space-y-3">
                {!seller.isApproved && !seller.isBanned && (
                  <button
                    onClick={toggleApprovalStatus}
                    disabled={actionLoading}
                    className="w-full py-4 rounded-2xl font-extrabold text-white text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve Merchant Account"}
                  </button>
                )}

                <button
                  onClick={toggleBanStatus}
                  disabled={actionLoading}
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition disabled:opacity-50 ${seller.isBanned
                      ? "bg-slate-800 hover:bg-slate-900 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                  {actionLoading ? "Processing..." : seller.isBanned ? "Unban Seller Account" : "Ban Seller Account"}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Admin Product Inspector Modal */}
      {showInspectModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#3F51F4]">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Product Inspector (Admin View)</h3>
                  <p className="text-xs text-slate-400 font-semibold">Catalog ID: {selectedProduct._id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInspectModal(false);
                  setSelectedProduct(null);
                }}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Image Showcase */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <img
                    src={selectedProduct.images?.[selectedImage] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product"}
                    alt={selectedProduct.title}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                          selectedImage === idx ? "border-[#3F51F4] ring-2 ring-[#3F51F4]/20" : "border-slate-200 opacity-70"
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Metadata */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Title & Categories */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full inline-block mb-2">
                    {selectedProduct.mainCategory} {selectedProduct.subCategory ? `> ${selectedProduct.subCategory}` : ''} {selectedProduct.subSubCategory ? `> ${selectedProduct.subSubCategory}` : ''}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 leading-snug">
                    {selectedProduct.title}
                  </h4>
                </div>

                {/* Price Breakdown Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Original MRP</p>
                    <p className="text-lg font-black text-slate-900">{currency}{selectedProduct.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Selling Price</p>
                    <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5">
                      {currency}{(() => {
                        const isExpired = selectedProduct.discountPeriod && new Date(selectedProduct.discountPeriod) <= new Date();
                        const sellingPrice = (selectedProduct.discountedPrice && selectedProduct.discountedPrice > 0 && selectedProduct.discountedPrice < selectedProduct.price)
                          ? selectedProduct.discountedPrice
                          : (selectedProduct.discount > 0 ? Math.round(selectedProduct.price * (1 - selectedProduct.discount / 100)) : selectedProduct.price);
                        const discountPct = selectedProduct.discount > 0
                          ? selectedProduct.discount
                          : (selectedProduct.discountedPrice && selectedProduct.discountedPrice < selectedProduct.price
                            ? Math.round(((selectedProduct.price - selectedProduct.discountedPrice) / selectedProduct.price) * 100)
                            : 0);
                        const isDiscountActive = !isExpired && discountPct > 0 && sellingPrice < selectedProduct.price;

                        return isDiscountActive ? sellingPrice.toLocaleString() : selectedProduct.price?.toLocaleString();
                      })()}
                      {(() => {
                        const isExpired = selectedProduct.discountPeriod && new Date(selectedProduct.discountPeriod) <= new Date();
                        const sellingPrice = (selectedProduct.discountedPrice && selectedProduct.discountedPrice > 0 && selectedProduct.discountedPrice < selectedProduct.price)
                          ? selectedProduct.discountedPrice
                          : (selectedProduct.discount > 0 ? Math.round(selectedProduct.price * (1 - selectedProduct.discount / 100)) : selectedProduct.price);
                        const discountPct = selectedProduct.discount > 0
                          ? selectedProduct.discount
                          : (selectedProduct.discountedPrice && selectedProduct.discountedPrice < selectedProduct.price
                            ? Math.round(((selectedProduct.price - selectedProduct.discountedPrice) / selectedProduct.price) * 100)
                            : 0);
                        const isDiscountActive = !isExpired && discountPct > 0 && sellingPrice < selectedProduct.price;

                        return isDiscountActive ? (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {discountPct}% OFF
                          </span>
                        ) : null;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Stock & Max Qty */}
                <div className="flex flex-wrap gap-3 text-xs font-bold">
                  <span className={`px-3 py-1.5 rounded-xl border ${selectedProduct.stock > 0 ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    📦 Stock: <span className="font-extrabold">{selectedProduct.stock} units</span>
                  </span>
                  {selectedProduct.maxQuantityPerPurchase && (
                    <span className="px-3 py-1.5 rounded-xl border bg-blue-50 border-blue-200 text-blue-800">
                      🛒 Max per purchase: <span className="font-extrabold">{selectedProduct.maxQuantityPerPurchase} units</span>
                    </span>
                  )}
                </div>

                {/* Description Box */}
                {selectedProduct.description && (
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Product Description</p>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}

                {/* Specifications / Attributes */}
                {selectedProduct.attributes && Object.keys(selectedProduct.attributes).length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Specifications</p>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(selectedProduct.attributes).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase block">{key}</span>
                          <span className="font-bold text-slate-800">{Array.isArray(val) ? val.join(", ") : String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <a
                href={`http://localhost:5173/products/${selectedProduct._id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3F51F4] hover:underline"
              >
                Open in User Storefront <ExternalLink size={14} />
              </a>
              <button
                onClick={() => {
                  setShowInspectModal(false);
                  setSelectedProduct(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSellerDetails;
