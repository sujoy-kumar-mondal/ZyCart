import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div
      className="
        bg-white rounded-2xl p-4 shadow-md
        border border-[#8FD6F6]/40
        transition-all hover:shadow-xl hover:-translate-y-1
      "
    >
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

      {/* Add to Cart Button */}
      {role === "user" && (<button
        onClick={() => product.isAvailable ? addToCart(product) : null}
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
      </button>)
      }
    </div>
  );
};

export default ProductCard;
