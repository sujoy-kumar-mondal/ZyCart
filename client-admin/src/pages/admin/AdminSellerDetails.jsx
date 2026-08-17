import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, Store, ShieldCheck, Ban } from "lucide-react";
import toast from "react-hot-toast";

const AdminSellerDetails = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSellerDetails();
    document.title = "Merchant Verification | ZyCart Admin";
  }, [sellerId]);

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
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  seller.isBanned ? "bg-red-100 text-red-800" : seller.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
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
                        <tr key={product._id} className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-extrabold text-slate-900 max-w-xs truncate">{product.title}</td>
                          <td className="px-4 py-3 font-black">₹{product.price?.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {product.discount > 0 && (!product.discountPeriod || new Date(product.discountPeriod) > new Date()) ? (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="font-black text-emerald-600">
                                  ₹{(product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price
                                    ? product.discountedPrice
                                    : Math.round(product.price * (1 - product.discount / 100))
                                  ).toLocaleString()}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                  {product.discount}% OFF
                                </span>
                              </div>
                            ) : product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price ? (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="font-black text-emerald-600">
                                  ₹{product.discountedPrice.toLocaleString()}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                                  {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
                                </span>
                              </div>
                            ) : (
                              <span className="font-black text-slate-900">
                                ₹{product.price?.toLocaleString()}
                              </span>
                            )}
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
                  className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition disabled:opacity-50 ${
                    seller.isBanned
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
    </div>
  );
};

export default AdminSellerDetails;
