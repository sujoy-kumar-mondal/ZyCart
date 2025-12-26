import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Loader from "../components/Loader";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthProvider";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const role = user?.role;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const viewTracked = useRef(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data.product);
        
        // Increment view count only for users, only once per product
        if (role === "user" && !viewTracked.current) {
          viewTracked.current = true;
          
          // Check if this product was already viewed in this session
          const viewedProducts = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
          
          if (!viewedProducts.includes(id)) {
            // Add to viewed list and update API
            viewedProducts.push(id);
            localStorage.setItem("viewedProducts", JSON.stringify(viewedProducts));
            await axios.post("/products/update-trend-view", { productId: id });
          }
        }
      } catch (error) {
        console.error("Error loading product", error);
        toast.error("Failed to load product!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, role]);

  // Check if product in wishlist
  useEffect(() => {
    if (product && role === "user") {
      setIsWishlisted(isInWishlist(product._id));
    }
  }, [product, role, isInWishlist]);

  // Update title
  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | ZyCart`;
    }
  }, [product]);

  // UI return (hooks above only)
  if (loading) return <Loader />;

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 py-20 text-lg"
      >
        Product not found.
      </motion.div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.png"];

  return (
    <>
      <div className="bg-linear-to-br from-gray-50 via-white to-blue-50 min-h-screen py-8 md:py-16">
        <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
          {/* BREADCRUMB */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-gray-600 mb-8 flex gap-2 items-center"
          >
            <span>Home</span>
            <span>›</span>
            <span className="text-[#3F51F4]">{product.title?.substring(0, 20)}...</span>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* LEFT COLUMN - IMAGES */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1 space-y-4"
            >
              {/* MAIN IMAGE */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-4">
                <motion.img
                  key={selectedImageIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={productImages[selectedImageIdx]}
                  alt={product.title}
                  className="w-full h-80 md:h-96 object-cover"
                />
                {/* WISHLIST ICON */}
                {role === "user" && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async () => {
                      if (isWishlisted) {
                        await removeFromWishlist(product._id);
                        setIsWishlisted(false);
                        toast.success("Removed from wishlist!");
                      } else {
                        const result = await addToWishlist(product);
                        if (result.success) {
                          setIsWishlisted(true);
                          toast.success("Added to wishlist!");
                        } else {
                          toast.error(result.message);
                        }
                      }
                    }}
                    className={`absolute top-4 right-4 backdrop-blur p-2.5 rounded-full shadow-lg transition ${
                      isWishlisted
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        isWishlisted ? "text-white" : "text-gray-600"
                      }`}
                      fill={isWishlisted ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* THUMBNAIL GALLERY */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {productImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`
                        shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden
                        transition-all shadow-sm
                        ${selectedImageIdx === idx
                          ? "border-[#3F51F4] ring-2 ring-[#3F51F4]/40"
                          : "border-gray-300 hover:border-[#6A8EF0]"
                        }
                      `}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* IMAGE COUNTER */}
              {productImages.length > 1 && (
                <div className="text-center text-xs text-gray-500 font-medium">
                  {selectedImageIdx + 1} / {productImages.length}
                </div>
              )}
            </motion.div>

            {/* MIDDLE & RIGHT COLUMNS - INFO */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="md:col-span-2 space-y-6"
            >
              {/* TITLE */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#1B2A41] leading-tight mb-3">
                  {product.title}
                </h1>
                
                {/* RATING & REVIEWS */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold flex items-center gap-1">
                      <span>⭐ 4.2</span>
                    </div>
                    <span className="text-gray-600 text-sm">28 ratings • 5 reviews</span>
                  </div>
                </div>
              </div>

              {/* PRICING SECTION */}
              <div className="bg-white/70 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] bg-clip-text text-transparent">
                    ₹{product.price}
                  </span>
                  <span className="text-lg text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
                  <span className="text-green-600 font-bold text-lg">17% off</span>
                </div>
              </div>

              {/* STOCK & AVAILABILITY */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Available Stock</p>
                  <p className={`text-2xl font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.stock} {product.stock === 1 ? "unit" : "units"}
                  </p>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <p className="text-gray-600 text-sm font-medium mb-1">Status</p>
                  <span className={`text-lg font-bold ${product.isAvailable ? "text-green-600" : "text-red-600"}`}>
                    {product.isAvailable ? "✓ Available" : "Unavailable"}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-[#1B2A41] mb-3">About this product</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description || "No description available for this product."}
                </p>
              </div>

              {/* OFFERS SECTION */}
              <div className="bg-white/60 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-lg font-semibold text-[#1B2A41]">Available Offers</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-green-600 text-xl">🎁</span>
                    <div>
                      <p className="font-medium text-gray-800">Special Discount</p>
                      <p className="text-gray-600">Get extra 10% off on bulk orders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="text-blue-600 text-xl">💳</span>
                    <div>
                      <p className="font-medium text-gray-800">No Cost EMI Available</p>
                      <p className="text-gray-600">On select credit cards • T&C apply</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-4 sticky bottom-4">
                {role === "user" ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={product.stock === 0 || !product.isAvailable}
                    onClick={() => {
                      if (product.isAvailable && product.stock > 0) {
                        addToCart(product);
                        toast.success("Added to cart!");
                      }
                    }}
                    className={`w-full py-4 rounded-xl text-lg font-semibold shadow-lg transition duration-200 ${
                      product.stock === 0 || !product.isAvailable
                        ? "bg-gray-300 cursor-not-allowed text-gray-600"
                        : "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-white hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    {!product.isAvailable
                      ? "Currently Unavailable"
                      : product.stock === 0
                      ? "Out of Stock"
                      : "🛒 Add to Cart"}
                  </motion.button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-gray-700 font-medium">Please login to add items to cart</p>
                  </div>
                )}
                
                {role === "user" && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (isWishlisted) {
                        await removeFromWishlist(product._id);
                        setIsWishlisted(false);
                        toast.success("Removed from wishlist!");
                      } else {
                        const result = await addToWishlist(product);
                        if (result.success) {
                          setIsWishlisted(true);
                          toast.success("Added to wishlist!");
                        } else {
                          toast.error(result.message);
                        }
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-lg font-semibold border-2 transition ${
                      isWishlisted
                        ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-[#3F51F4] bg-white text-[#3F51F4] hover:bg-blue-50"
                    }`}
                  >
                    {isWishlisted ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
