import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";
import axios from "../utils/axiosInstance.js";
import { useNavigate, Link } from "react-router-dom";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { MapPin, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft, Truck, AlertCircle } from "lucide-react";

const CheckoutPage = () => {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  const freeThreshold = settings.freeDeliveryThreshold ?? 499;
  const standardDeliveryFee = settings.deliveryFee ?? 40;
  const minOrderVal = settings.minOrderValue ?? 0;

  const isFreeDelivery = totalPrice >= freeThreshold;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;
  const finalTotal = totalPrice + deliveryFee;

  useEffect(() => {
    document.title = "Checkout — Shipping Address | " + (settings.platformName || "ZyCart");
    
    if (!user) {
      toast.error("Please login to proceed to checkout");
      navigate("/login");
      return;
    }

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
  }, [settings.platformName, user, navigate]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (minOrderVal > 0 && totalPrice < minOrderVal) {
      toast.error(`Minimum order value for checkout is ${currency}${minOrderVal}. Please add more items.`);
      return;
    }

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
            totalAmount: res.data.order.totalAmount || finalTotal,
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#3F51F4] text-white font-extrabold text-sm hover:bg-[#3444D8] transition"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B2A41]">Checkout</h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Step 1 of 2: Shipping Destination
            </p>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#3F51F4] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Shipping Address Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3F51F4] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#1B2A41]">Shipping Address</h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Enter the complete address where your order will be delivered.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Street / Flat / House No. &amp; Landmark <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="line1"
                    value={address.line1}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Flat 4B, Emerald Heights, Park Street"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Kolkata"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      required
                      placeholder="e.g. West Bengal"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Postal / PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 700001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#3F51F4]/40 focus:bg-white outline-none transition"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-900 font-semibold">
                  Estimated Delivery: <strong>{settings.estimatedDeliveryDays || "3-5 Business Days"}</strong>. All shipments are insured with contactless delivery.
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
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">{currency}{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Delivery Charge</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
                  ) : (
                    <span className="text-slate-900 font-bold">{currency}{deliveryFee}</span>
                  )}
                </div>

                {minOrderVal > 0 && totalPrice < minOrderVal && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Minimum purchase amount is {currency}{minOrderVal}.</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-slate-900">Total Payable</span>
                  <span className="text-3xl font-black text-slate-950">
                    {currency}{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] shadow-lg shadow-orange-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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
