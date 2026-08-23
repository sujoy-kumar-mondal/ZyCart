import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useSettings } from "../../context/SettingsProvider";
import { ArrowLeft, Edit, Eye, EyeOff, Tag, Package, Calendar, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

const SellerProductDetails = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
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
          document.title = `${res.data.product.title} — Merchant Inventory | ${brandName}`;
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
        toast.success(`Product is now ${updatedStatus ? "Visible" : "Hidden"} in catalog`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!product) return null;

  const isExpired = product.discountPeriod && new Date(product.discountPeriod) <= new Date();
  const hasDiscount = !isExpired && (product.discount > 0 || (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price));
  const effectivePrice = hasDiscount
    ? (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price
        ? product.discountedPrice
        : Math.round(product.price * (1 - (product.discount || 0) / 100)))
    : product.price;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate("/seller/products")}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3F51F4] hover:underline mb-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Products
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41]">
              {product.title}
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Category: <span className="text-slate-800 font-bold">{product.mainCategory} &gt; {product.subCategory} &gt; {product.subSubCategory}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/seller/products", { state: { editProductId: product._id } })}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white font-extrabold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Details
            </button>

            <button
              onClick={toggleAvailability}
              disabled={updatingStatus}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs text-white shadow-sm transition flex items-center gap-2 ${
                product.isAvailable
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {product.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {product.isAvailable ? "Hide Product" : "Publish Product"}
            </button>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
              <img
                src={product.images?.[selectedImage] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product+Image"}
                alt={product.title}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
              <span
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black uppercase ${
                  product.isAvailable
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-200 text-slate-700 border border-slate-300"
                }`}
              >
                {product.isAvailable ? "✓ Catalog Visible" : "✕ Hidden"}
              </span>
            </div>

            {/* Thumbnails list */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImage === idx
                        ? "border-[#3F51F4] shadow-md scale-105"
                        : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Inventory Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pricing & Discount Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Tag className="w-5 h-5 text-[#3F51F4]" />
                <h2 className="text-lg font-extrabold text-[#1B2A41]">
                  Pricing &amp; Active Discount
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Original MRP</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {currency}{product.price?.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Discounted Selling Price</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {hasDiscount ? `${currency}${effectivePrice.toLocaleString()}` : "—"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Active Discount</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">
                    {hasDiscount ? `${product.discount}% OFF` : "None"}
                  </p>
                </div>
              </div>

              {hasDiscount && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs">
                  <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-500">Discount Expiry Timeline</p>
                    <p className="font-black text-slate-900 mt-0.5">
                      {product.discountPeriod
                        ? `Discount expires on ${new Date(product.discountPeriod).toLocaleString()}`
                        : "Permanent Active Store Discount"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Package className="w-5 h-5 text-[#3F51F4]" />
                <h2 className="text-lg font-extrabold text-[#1B2A41]">
                  Stock Inventory &amp; Order Constraints
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Available Warehouse Stock</p>
                  <p className="text-2xl font-black text-amber-900 mt-1">
                    {product.stock} units
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Max Purchase Limit Per Order</p>
                  <p className="text-2xl font-black text-indigo-900 mt-1">
                    {product.maxQuantityPerPurchase || 1} unit(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-3">
                <h2 className="text-lg font-extrabold text-[#1B2A41] border-b border-slate-100 pb-3">
                  Product Description
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                  {product.description}
                </p>
              </div>
            )}

            {/* Attributes Specs Grid */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <ShieldCheck className="w-5 h-5 text-[#3F51F4]" />
                  <h2 className="text-lg font-extrabold text-[#1B2A41]">
                    Product Specifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-extrabold uppercase text-slate-400">{key}</p>
                      <p className="text-xs font-black text-slate-900 mt-0.5">
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default SellerProductDetails;
