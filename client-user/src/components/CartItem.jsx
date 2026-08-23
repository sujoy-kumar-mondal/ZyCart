import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useSettings } from "../context/SettingsProvider";
import toast from "react-hot-toast";

const CartItem = ({ item }) => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const { removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  const maxAllowed = item.maxQuantityPerPurchase
    ? Math.min(item.stock, item.maxQuantityPerPurchase)
    : item.stock;

  const increase = () => {
    if (item.qty < maxAllowed) {
      updateQty(item.productId, item.qty + 1);
    }
  };

  const decrease = () => {
    if (item.qty > 1) {
      updateQty(item.productId, item.qty - 1);
    }
  };

  return (
    <div
      className="
        flex gap-5 items-center p-5 rounded-2xl
        bg-white shadow-md border border-[#8FD6F6]/40
      "
    >
      {/* Image - Clickable */}
      <img
        src={item.image || "/placeholder.png"}
        alt={item.title}
        onClick={() => navigate(`/product/${item.productId}`)}
        className="w-24 h-24 object-cover rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition"
      />

      {/* Item Info - Clickable */}
      <div 
        className="flex flex-col grow cursor-pointer"
        onClick={() => navigate(`/product/${item.productId}`)}
      >
        <h3 className="font-semibold text-lg text-[#1B2A41] hover:text-[#6A8EF0] transition">{item.title}</h3>

        <p className="text-[#3F51F4] font-bold text-lg">{currency}{item.price?.toLocaleString ? item.price.toLocaleString() : item.price}</p>

        {item.stock < 10 && (
          <p className="text-xs font-semibold text-amber-600 mt-0.5">
            {item.stock < 5 ? `Only ${item.stock} left` : "Only few left"}
          </p>
        )}

        {/* Quantity Controls - Not clickable for navigation */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              decrease();
            }}
            disabled={item.qty <= 1}
            className={`
              w-9 h-9 flex items-center justify-center rounded-lg border text-[#1B2A41] transition
              ${item.qty <= 1 ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" : "bg-[#F1F8FF] border-[#8FD6F6]/50 hover:bg-[#e4f3ff]"}
            `}
          >
            -
          </button>

          <span className="font-semibold text-[#1B2A41]">{item.qty}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              increase();
            }}
            disabled={item.qty >= maxAllowed}
            className={`
              w-9 h-9 flex items-center justify-center rounded-lg border text-[#1B2A41] transition
              ${item.qty >= maxAllowed ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" : "bg-[#F1F8FF] border-[#8FD6F6]/50 hover:bg-[#e4f3ff]"}
            `}
            title={item.qty >= maxAllowed ? `Maximum ${maxAllowed} allowed` : "Increase quantity"}
          >
            +
          </button>
        </div>
      </div>

      {/* Remove Button - Not clickable for navigation */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromCart(item.productId);
        }}
        className="
          text-red-500 hover:text-red-600 hover:underline text-sm font-semibold
        "
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
