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
        flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center p-4 sm:p-5 rounded-2xl
        bg-white shadow-sm border border-slate-200/80 hover:shadow-md transition
      "
    >
      {/* Image - Clickable */}
      <img
        src={item.image || "/placeholder.png"}
        alt={item.title}
        onClick={() => navigate(`/product/${item.productId}`)}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-xs cursor-pointer hover:opacity-90 transition shrink-0"
      />

      {/* Item Info - Clickable */}
      <div 
        className="flex flex-col grow cursor-pointer w-full min-w-0"
        onClick={() => navigate(`/product/${item.productId}`)}
      >
        <h3 className="font-bold text-base sm:text-lg text-[#1B2A41] hover:text-[#3F51F4] transition line-clamp-2">{item.title}</h3>

        <p className="text-[#3F51F4] font-black text-lg mt-1">{currency}{item.price?.toLocaleString ? item.price.toLocaleString() : item.price}</p>

        {item.stock < 10 && (
          <p className="text-xs font-semibold text-amber-600 mt-0.5">
            {item.stock < 5 ? `Only ${item.stock} left in stock` : "Limited stock available"}
          </p>
        )}

        {/* Quantity Controls & Remove row */}
        <div className="flex items-center justify-between sm:justify-start gap-4 mt-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full">
          <div className="flex items-center gap-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                decrease();
              }}
              disabled={item.qty <= 1}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg border text-[#1B2A41] font-bold transition
                ${item.qty <= 1 ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" : "bg-[#F1F8FF] border-blue-200 hover:bg-blue-100"}
              `}
            >
              -
            </button>

            <span className="font-extrabold text-[#1B2A41] text-sm px-2">{item.qty}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                increase();
              }}
              disabled={item.qty >= maxAllowed}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg border text-[#1B2A41] font-bold transition
                ${item.qty >= maxAllowed ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" : "bg-[#F1F8FF] border-blue-200 hover:bg-blue-100"}
              `}
              title={item.qty >= maxAllowed ? `Maximum ${maxAllowed} allowed` : "Increase quantity"}
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromCart(item.productId);
            }}
            className="
              text-red-500 hover:text-red-700 text-xs sm:text-sm font-bold sm:ml-auto transition cursor-pointer
            "
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
