import React, { useEffect } from "react";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartProvider";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft } from "lucide-react";

const CartPage = () => {
  const { cartItems, totalPrice, totalQuantity } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Shopping Cart | ZyCart";
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 text-center max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-[#3F51F4] rounded-full flex items-center justify-center mx-auto text-3xl">
            🛒
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#1B2A41]">Your Shopping Cart is Empty</h2>
            <p className="text-slate-500 text-sm">
              Looks like you haven't added any products to your cart yet.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] text-white font-extrabold text-base shadow-lg shadow-blue-500/20 hover:opacity-95 transition transform active:scale-95"
          >
            Start Shopping Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total original savings if any item has discount
  const totalOriginalPrice = cartItems.reduce((sum, item) => {
    const orig = item.originalPrice || item.price;
    return sum + (orig * item.qty);
  }, 0);

  const totalSavings = Math.max(0, totalOriginalPrice - totalPrice);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B2A41]">Shopping Cart</h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart ({totalQuantity} total units)
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#3F51F4] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-xl font-extrabold text-[#1B2A41] border-b border-slate-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Unique Items</span>
                  <span className="text-slate-900 font-bold">{cartItems.length}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Total Quantity</span>
                  <span className="text-slate-900 font-bold">{totalQuantity}</span>
                </div>

                {totalOriginalPrice > totalPrice && (
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Original Price</span>
                    <span className="line-through text-slate-400">₹{totalOriginalPrice.toLocaleString()}</span>
                  </div>
                )}

                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                    <span>Instant Discount Savings</span>
                    <span>- ₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#1B2A41]">Total Amount</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* CTA Checkout Button */}
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure SSL</span>
                <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-blue-500" /> Doorstep Delivery</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartPage;
