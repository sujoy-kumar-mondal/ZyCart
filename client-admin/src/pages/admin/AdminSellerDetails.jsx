import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import Loader from "../../components/Loader";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
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
    document.title = "Seller Details | ZyCart Admin";
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

  if (loading) return <Loader />;

  if (!seller) {
    return (
      <div className="text-center mt-20 max-w-screen-2xl container mx-auto">
        <h2 className="text-xl font-semibold text-red-500">Seller not found</h2>
        <button
          className="mt-4 px-6 py-2 rounded-lg text-white font-semibold bg-[#3F51F4]"
          onClick={() => navigate("/admin/sellers")}
        >
          Back to Sellers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/admin/sellers")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1B2A41]">Seller Details</h1>
          <p className="text-gray-600">Manage seller account and operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Seller Profile */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Seller Profile</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-gray-600 text-sm mb-2">Shop Name</p>
                <p className="text-[#1B2A41] font-bold text-lg">{seller?.shopName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Owner Name</p>
                <p className="text-[#1B2A41] font-semibold">{seller?.name || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Shop Type</p>
                <p className="text-[#1B2A41] font-semibold capitalize">{seller?.shopType}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </p>
                <p className="text-[#1B2A41] font-semibold">{seller?.email || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Mobile
                </p>
                <p className="text-[#1B2A41] font-semibold">{seller?.mobile || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Business Information</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">PAN Number</p>
                <p className="text-[#1B2A41] font-semibold text-lg">
                  {seller?.pan || "Not provided"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">GST Number</p>
                <p className="text-[#1B2A41] font-semibold text-lg">
                  {seller?.gst || "Not provided"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">AADHAR Number</p>
                <p className="text-[#1B2A41] font-semibold text-lg">
                  {seller?.aadhar ? `****${seller.aadhar.slice(-4)}` : "Not provided"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${
                  seller?.isBanned
                    ? "bg-red-100 text-red-800"
                    : seller?.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}>
                  {seller?.isBanned ? "Banned" : seller?.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" /> Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">Total Products</p>
                <p className="text-2xl font-bold text-[#3F51F4]">{seller?.totalProducts || 0}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-gray-600 text-sm mb-1">Account Created</p>
                <p className="text-[#1B2A41] font-semibold text-sm">
                  {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          {products && products.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
              <h2 className="text-2xl font-bold text-[#1B2A41] mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> Products
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b">
                    <tr className="text-gray-600">
                      <th className="py-2">Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr key={product._id} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <p className="font-semibold text-[#1B2A41]">{product.title}</p>
                        </td>
                        <td className="font-semibold">₹{product.price?.toLocaleString()}</td>
                        <td className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {products.length > 10 && (
                <p className="text-center text-gray-600 text-sm mt-4">
                  +{products.length - 10} more products
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40 sticky top-20 space-y-4">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-6">Actions</h3>

            {!seller?.isApproved && !seller?.isBanned && (
              <button
                onClick={toggleApprovalStatus}
                disabled={actionLoading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Approve Seller"}
              </button>
            )}

            <button
              onClick={toggleBanStatus}
              disabled={actionLoading}
              className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 ${
                seller?.isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionLoading ? "Processing..." : seller?.isBanned ? "Unban Seller" : "Ban Seller"}
            </button>

            {/* Status Cards */}
            <div className="border-t pt-6 mt-6">
              {seller?.isApproved && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-3">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Approved</p>
                      <p className="text-green-700 text-xs mt-1">This seller can list and sell products</p>
                    </div>
                  </div>
                </div>
              )}

              {seller?.isBanned && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-semibold text-sm">Account Banned</p>
                      <p className="text-red-700 text-xs mt-1">All products are unavailable to customers</p>
                    </div>
                  </div>
                </div>
              )}

              {!seller?.isApproved && !seller?.isBanned && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-semibold text-sm">Pending Approval</p>
                      <p className="text-yellow-700 text-xs mt-1">Seller is awaiting admin approval</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="border-t pt-6 mt-6">
              <h4 className="font-bold text-[#1B2A41] mb-4">Account ID</h4>
              <p className="text-gray-600 text-xs font-mono bg-gray-50 p-3 rounded break-all">
                {seller?._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSellerDetails;
