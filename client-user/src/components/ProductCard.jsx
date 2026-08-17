import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartProvider";
import { useWishlist } from "../context/WishlistProvider";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
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
        bg-white rounded-2xl p-4 shadow-md
        border border-slate-200/80
        transition-all hover:shadow-xl hover:-translate-y-1
        relative flex flex-col justify-between h-full group
      "
    >
      {/* Top Part: Image + Title + Price */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10 disabled:opacity-50"
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-all ${inWishlist ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-red-500"
                }`}
            />
          </button>

          {/* Product Image */}
          <Link to={`/product/${product._id}`} className="block overflow-hidden rounded-xl bg-slate-50">
            <img
              src={product.images?.[0] || "https://placehold.co/400x400/e2e8f0/1e293b?text=Product+Image"}
              alt={product.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/e2e8f0/1e293b?text=Product+Image";
              }}
              className="w-full h-52 object-cover rounded-xl group-hover:scale-105 transition duration-300"
            />
          </Link>

          {/* Product Title */}
          <h3 className="font-semibold text-base sm:text-lg text-[#1B2A41] line-clamp-1 mt-3">
            {product.title}
          </h3>
        </div>

        {/* Pricing & Stock Details (Equalized Min-Height) */}
        <div className="space-y-1.5 pt-2">
          {hasActiveDiscount ? (
            <div className="flex items-baseline gap-2 flex-wrap min-h-[1.75rem]">
              <span className="font-extrabold text-xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-transparent bg-clip-text">
                ₹{discountedPrice.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                {discountPct}% OFF
              </span>
            </div>
          ) : (
            <div className="min-h-[1.75rem] flex items-center">
              <p className="font-extrabold text-xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-transparent bg-clip-text">
                ₹{product.price.toLocaleString()}
              </p>
            </div>
          )}

          {/* Stock Scarcity (Equalized Min-Height placeholder) */}
          <div className="min-h-[1.25rem]">
            {product.stock < 10 && (
              <p className="text-xs font-bold text-amber-600">
                {product.stock < 5 ? `Only ${product.stock} left in stock!` : "Only few left"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Button (Always Flush at Bottom) */}
      <div className="pt-3 mt-auto">
        <button
          onClick={() => {
            if (product.isAvailable && product.stock > 0) {
              addToCart(product);
              toast.success("Added to cart!");
            }
          }}
          disabled={product.stock === 0}
          className={`
            w-full py-2.5 rounded-xl font-extrabold text-white transition shadow-sm text-sm
            ${product.isAvailable
              ? product.stock === 0
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-blue-500/20 active:scale-95"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
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
