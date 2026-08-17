import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, Eye, EyeOff, Tag, Package, Calendar, ShieldCheck, ShoppingBag } from "lucide-react";

const SellerProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        } else {
          toast.error("Product not found");
          navigate("/seller/products");
        }
      } catch (err) {
        toast.error("Failed to load product details");
        navigate("/seller/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const toggleAvailability = async () => {
    if (!product) return;
    try {
      setUpdatingStatus(true);
      const updatedStatus = !product.isAvailable;
      const res = await axios.put(`/seller/products/${product._id}`, {
        isAvailable: updatedStatus,
      });

      if (res.data.success) {
        setProduct((prev) => ({ ...prev, isAvailable: updatedStatus }));
        toast.success(`Product is now ${updatedStatus ? "Available" : "Hidden"}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return null;
  }

  const hasDiscount = product.discount > 0;
  const effectivePrice = product.discountedPrice && product.discountedPrice > 0
    ? product.discountedPrice
    : Math.round(product.price * (1 - (product.discount || 0) / 100));

  return (
    <div className="py-8 space-y-6">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <div>
          <button
            onClick={() => navigate("/seller/products")}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-2 transition"
          >
            <ArrowLeft size={16} /> Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
            {product.title}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Category: {product.mainCategory} &gt; {product.subCategory} &gt; {product.subSubCategory}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/seller/products", { state: { editProductId: product._id } })}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm text-sm transition"
          >
            <Edit size={16} /> Edit Product
          </button>

          <button
            onClick={toggleAvailability}
            disabled={updatingStatus}
            className={`flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-lg shadow-sm text-sm transition ${
              product.isAvailable
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {product.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
            {product.isAvailable ? "Hide Product" : "Show Product"}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200 overflow-hidden">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={product.images?.[selectedImage] || "/placeholder.png"}
                alt={product.title}
                className="w-full h-full object-contain p-2"
              />
              <span
                className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  product.isAvailable
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {product.isAvailable ? "✓ Active" : "✕ Hidden"}
              </span>
            </div>

            {/* Thumbnail Selector */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      selectedImage === idx
                        ? "border-blue-600 shadow-md scale-105"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Seller Information Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Price & Discount Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Tag className="text-blue-600" size={20} /> Pricing & Discount Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Original Price</p>
                <p className="text-2xl font-extrabold text-blue-700 mt-1">
                  ₹{product.price?.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discounted Price</p>
                <p className="text-2xl font-extrabold text-green-700 mt-1">
                  {hasDiscount ? `₹${effectivePrice.toLocaleString()}` : "—"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Discount Percentage</p>
                <p className="text-2xl font-extrabold text-purple-700 mt-1">
                  {hasDiscount ? `${product.discount}% OFF` : "No Discount"}
                </p>
              </div>
            </div>

            {/* Discount Period Banner */}
            {hasDiscount && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                <Calendar className="text-blue-600 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Discount Duration</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {product.discountPeriod
                      ? `Valid until ${new Date(product.discountPeriod).toLocaleString()}`
                      : "Permanent Discount (All Time)"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Inventory & Limits Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
              <Package className="text-blue-600" size={20} /> Inventory & Purchase Limits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock Quantity</p>
                <p className="text-xl font-bold text-amber-800 mt-1">
                  {product.stock} units
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Max Purchase Per Order</p>
                <p className="text-xl font-bold text-blue-800 mt-1">
                  {product.maxQuantityPerPurchase || 1} unit(s)
                </p>
              </div>
            </div>
          </div>

          {/* Specifications / Attributes Table */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                <ShieldCheck className="text-blue-600" size={20} /> Specifications & Attributes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{key}</dt>
                    <dd className="text-sm font-bold text-gray-900 mt-0.5">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Description */}
          {product.description && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 space-y-3">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-3">
                Product Description
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProductDetails;
