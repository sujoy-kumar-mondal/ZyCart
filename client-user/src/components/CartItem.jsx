import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartProvider";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  const increase = () => {
    if (item.qty < item.stock) {
      updateQty(item.productId, item.qty + 1);
    } else {
      alert(`Maximum stock available: ${item.stock}`);
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

        <p className="text-[#3F51F4] font-bold text-lg">₹{item.price}</p>

        <p className="text-gray-600 text-sm">Stock: {item.stock}</p>

        {/* Quantity Controls - Not clickable for navigation */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              decrease();
            }}
            className="
              w-9 h-9 flex items-center justify-center rounded-lg
              bg-[#F1F8FF] border border-[#8FD6F6]/50 text-[#1B2A41]
              hover:bg-[#e4f3ff] transition
            "
          >
            -
          </button>

          <span className="font-semibold text-[#1B2A41]">{item.qty}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              increase();
            }}
            className="
              w-9 h-9 flex items-center justify-center rounded-lg
              bg-[#F1F8FF] border border-[#8FD6F6]/50 text-[#1B2A41]
              hover:bg-[#e4f3ff] transition
            "
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
