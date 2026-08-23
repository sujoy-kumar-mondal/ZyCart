import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { useCart } from "../context/CartProvider";
import { useSettings } from "../context/SettingsProvider";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { CreditCard, ShieldCheck, CheckCircle2, Truck, Wallet, Smartphone, Banknote } from "lucide-react";

const PaymentPage = () => {
  const { settings } = useSettings();
  const currency = settings?.currencySymbol || "₹";
  const brandName = settings?.platformName || "ZyCart";
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { orderId, totalAmount, cartItems } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `Payment Method — Checkout | ${brandName}`;
    if (!orderId) {
      navigate("/checkout");
    }
  }, [brandName]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    setLoading(true);

    try {
      await axios.patch(`/orders/${orderId}`, {
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === "cod" ? "pending" : "completed",
      });

      clearCart();

      toast.success("Order & Payment confirmed successfully!");
      navigate("/my-orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment processing failed!");
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Checkout Stepper Bar */}
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
              <span>Shipping Address</span>
            </div>
            <div className="h-0.5 w-12 sm:w-24 bg-emerald-400"></div>
            <div className="flex items-center gap-2 text-[#3F51F4]">
              <span className="w-8 h-8 rounded-full bg-[#3F51F4] text-white flex items-center justify-center font-black">2</span>
              <span>Payment Method</span>
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
          
          {/* LEFT: Payment Methods Selection */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <CreditCard className="w-6 h-6 text-[#3F51F4]" />
              <h2 className="text-xl font-extrabold text-[#1B2A41]">
                Select Payment Method
              </h2>
            </div>

            <div className="space-y-4">
              
              {/* Cash on Delivery (Active Option) */}
              <div
                onClick={() => setSelectedMethod("cod")}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  selectedMethod === "cod"
                    ? "border-[#3F51F4] bg-blue-50/50 shadow-md"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#1B2A41] text-base">Cash on Delivery (COD)</h3>
                    <p className="text-xs text-slate-500 font-medium">Pay via Cash / UPI at the time of delivery.</p>
                  </div>
                </div>

                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedMethod === "cod"}
                  onChange={() => setSelectedMethod("cod")}
                  className="w-5 h-5 text-[#3F51F4] accent-[#3F51F4] cursor-pointer"
                />
              </div>

              {/* UPI (Coming Soon) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-200 text-slate-600">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">UPI / QR Payment</h3>
                    <p className="text-xs text-slate-500">GPay, PhonePe, Paytm (Integration in progress)</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">
                  Coming Soon
                </span>
              </div>

              {/* Cards (Coming Soon) */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-200 text-slate-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Credit / Debit / ATM Card</h3>
                    <p className="text-xs text-slate-500">Visa, Mastercard, RuPay (Integration in progress)</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">
                  Coming Soon
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT: Order Summary Card */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h2 className="text-xl font-extrabold text-[#1B2A41] border-b border-slate-100 pb-4">
                Final Amount
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Order Reference</span>
                  <span className="text-slate-900 font-mono font-bold">#{orderId?.slice(-6)}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-extrabold text-[#1B2A41]">Payable Amount</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                    {currency}{totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                Confirm Order &amp; Pay
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-Bit Encrypted Payment</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
