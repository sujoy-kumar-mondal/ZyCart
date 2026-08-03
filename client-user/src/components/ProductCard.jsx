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
  
  // Compute inWishlist dynamically so it updates when wishlist context changes
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

  return (
    <div
      className="
        bg-white rounded-2xl p-4 shadow-md
        border border-[#8FD6F6]/40
        transition-all hover:shadow-xl hover:-translate-y-1
        relative
      "
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all z-10 disabled:opacity-50"
      >
        <Heart
          className={`w-5 h-5 transition-all ${
            inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
          }`}
        />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.title}
          className="w-full h-52 object-cover rounded-xl"
        />
      </Link>

      {/* Product Info */}
      <div className="mt-3 space-y-1">
        <h3 className="font-semibold text-lg text-[#1B2A41] line-clamp-1">
          {product.title}
        </h3>

        <p
          className="
            font-extrabold text-xl
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            text-transparent bg-clip-text
          "
        >
          ₹{product.price}
        </p>

        <p className="text-sm text-gray-600">
          Stock: {product.stock}
        </p>
      </div>
      <button
        onClick={() => {
          if (product.isAvailable && product.stock > 0) {
            addToCart(product);
            toast.success("Added to cart!");
          }
        }}
        disabled={product.stock === 0}
        className={`
          w-full mt-4 py-2 rounded-xl font-semibold text-white transition shadow-sm
          ${product.isAvailable ? product.stock === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-90"
            : "bg-gray-400 cursor-not-allowed"
          }
        `}
      >
        {product.isAvailable ? product.stock === 0 ? "Out of Stock" : "Add to Cart" : "Unavailable"}
      </button>
    </div>
  );
};

export default ProductCard;
