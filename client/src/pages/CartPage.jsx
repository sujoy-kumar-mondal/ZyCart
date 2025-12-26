import React, { useEffect } from "react";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartProvider";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cartItems, totalPrice, totalQuantity } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Cart | ZyCart";
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="text-center text-gray-600 py-20 text-lg">
        Your cart is empty.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 grid md:grid-cols-3 gap-10">

        {/* LEFT: CART ITEMS */}
        <div className="md:col-span-2 space-y-5">
          {cartItems.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        {/* RIGHT: SUMMARY */}
        <div
          className="
          bg-white p-8 rounded-2xl shadow-xl h-fit
          border border-[#8FD6F6]/40
        "
        >
          <h2 className="text-2xl font-bold text-[#1B2A41] mb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Total Items:</span>
              <span className="font-medium text-[#1B2A41]">
                {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Quantity:</span>
              <span>
                {totalQuantity}
              </span>
            </div>

            <div className="flex justify-between text-xl font-bold pt-2">
              <span>Total Price:</span>
              <span className="text-[#1B2A41]">₹{totalPrice}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => navigate("/checkout")}
            className="
            w-full py-3 mt-6 text-lg rounded-xl text-white font-semibold
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            hover:opacity-90 transition shadow-md
          "
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;
