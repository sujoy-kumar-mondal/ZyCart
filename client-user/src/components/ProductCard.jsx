import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const inWishlist = isInWishlist(product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        const result = await removeFromWishlist(product._id);
        if (result.success) {
          toast.success("Removed from wishlist");
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await addToWishlist({ _id: product._id });
        if (result.success) {
          toast.success("Added to wishlist!");
        } else {
          toast.error(result.message);
        }
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const isExpired = product.discountPeriod && new Date(product.discountPeriod) <= new Date();
  const hasActiveDiscount = !isExpired && (product.discount > 0 || (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price));

  const discountedPrice = hasActiveDiscount
    ? (product.discountedPrice && product.discountedPrice > 0 && product.discountedPrice < product.price
        ? product.discountedPrice
        : Math.round(product.price * (1 - (product.discount || 0) / 100)))
    : product.price;

  const discountPct = product.discount > 0
    ? product.discount
    : (product.discountedPrice && product.discountedPrice < product.price ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0);

  return (
    <div
      className="
        bg-white rounded-3xl p-4 sm:p-5 shadow-sm
        border border-slate-200/80
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        relative flex flex-col justify-between h-full group w-full min-w-0
      "
    >
      {/* Top Part: Image + Title + Price */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-md hover:shadow-lg transition-all z-10 disabled:opacity-50"
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-all ${inWishlist ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"
                }`}
            />
          </button>

          {/* Product Image */}
          <Link to={`/product/${product._id}`} className="block overflow-hidden rounded-2xl bg-slate-50 relative aspect-4/3 w-full">
            <img
              src={product.images?.[0] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product+Image"}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=Product+Image";
              }}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
            />
          </Link>

          {/* Product Title */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-bold text-sm sm:text-base text-[#1B2A41] line-clamp-2 min-h-[2.5rem] mt-3 group-hover:text-[#3F51F4] transition leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Stock Details */}
        <div className="space-y-1.5 pt-2">
          {hasActiveDiscount ? (
            <div className="flex items-baseline gap-2 flex-wrap min-h-[1.75rem]">
              <span className="font-extrabold text-lg sm:text-xl text-[#1B2A41]">
                {settings?.currencySymbol || "₹"}{discountedPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {settings?.currencySymbol || "₹"}{product.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {discountPct}% OFF
              </span>
            </div>
          ) : (
            <div className="min-h-[1.75rem] flex items-center">
              <p className="font-extrabold text-lg sm:text-xl text-[#1B2A41]">
                {settings?.currencySymbol || "₹"}{product.price.toLocaleString()}
              </p>
            </div>
          )}

          {/* Stock Scarcity */}
          <div className="min-h-[1.25rem]">
            {product.stock > 0 && product.stock < 10 && (
              <p className="text-[11px] font-bold text-amber-600">
                {product.stock < 5 ? `Only ${product.stock} left in stock!` : "Limited stock available"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-3 mt-auto">
        <button
          onClick={() => {
            if (product.isAvailable && product.stock > 0) {
              addToCart(product);
              toast.success("Added to cart!");
            }
          }}
          disabled={!product.isAvailable || product.stock === 0}
          className={`
            w-full py-3 rounded-2xl font-extrabold text-white transition shadow-sm text-xs sm:text-sm flex items-center justify-center gap-2
            ${product.isAvailable && product.stock > 0
              ? "bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-md shadow-blue-500/20 active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {product.isAvailable ? (product.stock === 0 ? "Out of Stock" : "Add to Cart") : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
