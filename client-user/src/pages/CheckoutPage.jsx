import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { MapPin, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft, Truck } from "lucide-react";

const CheckoutPage = () => {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Checkout — Shipping Address | ZyCart";
    
    const loadUserAddress = async () => {
      try {
        const res = await axios.get("/users/profile");
        if (res.data.success && res.data.user?.address) {
          setAddress(res.data.user.address);
        }
      } catch (error) {
        console.error("Address load error:", error);
      }
    };
    
    loadUserAddress();
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.state || !address.postalCode) {
      toast.error("Please fill in all shipping address fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/orders/place", {
        items: cartItems,
        address,
      });

      if (res.data.success) {
        for (const item of cartItems) {
          try {
            await axios.post("/products/update-trend-purchase", {
              productId: item.productId,
              quantity: item.qty,
            });
          } catch (err) {}
        }

        toast.success("Shipping address saved! Proceed to payment.");
        navigate("/payment", { 
          state: { 
            orderId: res.data.order._id,
            totalAmount: totalPrice,
            cartItems: cartItems 
          } 
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order placement failed!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 text-center max-w-md w-full space-y-4">
          <p className="text-4xl">🛒</p>
          <h2 className="text-2xl font-extrabold text-[#1B2A41]">Your cart is empty</h2>
          <p className="text-slate-500 text-sm">Add products to your cart before proceeding to checkout.</p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#3F51F4] text-white font-extrabold text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Checkout Stepper Bar */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
            <div className="flex items-center gap-2 text-[#3F51F4]">
              <span className="w-8 h-8 rounded-full bg-[#3F51F4] text-white flex items-center justify-center font-black">1</span>
              <span>Shipping Address</span>
            </div>
            <div className="h-0.5 w-12 sm:w-24 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">2</span>
              <span>Payment</span>
            </div>
            <div className="h-0.5 w-12 sm:w-24 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Address Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <MapPin className="w-6 h-6 text-[#3F51F4]" />
              <h2 className="text-xl font-extrabold text-[#1B2A41]">
                Delivery Address Information
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Street Address / House No. *
                </label>
                <input
                  type="text"
                  name="line1"
                  value={address.line1}
                  onChange={handleChange}
                  placeholder="e.g. 123 Park Street, Flat 4B"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    placeholder="e.g. Kolkata"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    placeholder="e.g. West Bengal"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    placeholder="e.g. 700001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-900 font-semibold">
                  Standard Doorstep Shipping applies to this address. All shipments are insured.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-xl font-extrabold text-[#1B2A41] border-b border-slate-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Items Count</span>
                  <span className="text-slate-900 font-bold">{cartItems.length}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#1B2A41]">Total Amount</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                    ₹{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                Continue to Payment <ArrowRight className="w-5 h-5" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
