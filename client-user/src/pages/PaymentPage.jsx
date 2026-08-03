import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import { useCart } from "../context/CartProvider";
import Loader from "../components/Loader";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { orderId, totalAmount, cartItems } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Payment | ZyCart";
    
    // Redirect to checkout if no order data
    if (!orderId) {
      navigate("/checkout");
    }
  }, []);

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }

    setLoading(true);

    try {
      // Update order with payment method
      await axios.patch(`/orders/${orderId}`, {
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === "cod" ? "pending" : "completed",
      });

      // Clear cart only after payment confirmation
      clearCart();

      alert("Payment completed successfully!");
      navigate("/my-orders");
    } catch (error) {
      alert(error.response?.data?.message || "Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 grid md:grid-cols-3 gap-10">
      
      {/* LEFT: PAYMENT METHODS */}
      <div className="md:col-span-2">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-[#8FD6F6]/40">
          <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">
            Complete Payment
          </h2>

          <div className="space-y-4">
            {/* Cash on Delivery */}
            <div className="border border-gray-300 rounded-xl p-5 cursor-pointer hover:bg-gray-50 transition">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedMethod === "cod"}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#1B2A41] text-lg">
                    Cash on Delivery
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Pay safely using Cash on Delivery
                  </p>
                </div>
              </label>
            </div>

            {/* UPI (Coming Soon) */}
            <div className="border border-gray-300 rounded-xl p-5 opacity-50 cursor-not-allowed">
              <label className="flex items-center cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#1B2A41] text-lg">
                    UPI
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Coming Soon
                  </p>
                </div>
              </label>
            </div>

            {/* Credit/Debit Card (Coming Soon) */}
            <div className="border border-gray-300 rounded-xl p-5 opacity-50 cursor-not-allowed">
              <label className="flex items-center cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#1B2A41] text-lg">
                    Credit / Debit / ATM Card
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Coming Soon
                  </p>
                </div>
              </label>
            </div>

            {/* Wallet (Coming Soon) */}
            <div className="border border-gray-300 rounded-xl p-5 opacity-50 cursor-not-allowed">
              <label className="flex items-center cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#1B2A41] text-lg">
                    Wallet / Gift Card
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Coming Soon
                  </p>
                </div>
              </label>
            </div>

            {/* EMI (Coming Soon) */}
            <div className="border border-gray-300 rounded-xl p-5 opacity-50 cursor-not-allowed">
              <label className="flex items-center cursor-not-allowed opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="emi"
                  disabled
                  className="w-4 h-4 cursor-not-allowed"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#1B2A41] text-lg">
                    EMI
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Coming Soon
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: ORDER SUMMARY */}
      <div className="md:col-span-1">
        <div className="bg-white shadow-xl rounded-2xl p-8 h-fit border border-[#8FD6F6]/40 sticky top-20">
          <h2 className="text-xl font-bold text-[#1B2A41] mb-6">
            Order Summary
          </h2>

          {/* Price Breakdown */}
          <div className="space-y-4 text-gray-700 border-b border-gray-200 pb-4">
            <div className="flex justify-between">
              <span className="text-sm">Price ({cartItems?.length} item{cartItems?.length > 1 ? 's' : ''})</span>
              <span className="text-sm font-medium text-[#1B2A41]">₹{totalAmount}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm">Delivery Charges</span>
              <span className="text-sm font-medium text-green-600">FREE</span>
            </div>

            {/* Discount (if any) */}
            <div className="flex justify-between">
              <span className="text-sm">Discount</span>
              <span className="text-sm font-medium text-green-600">₹0</span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between mt-4 mb-6">
            <span className="text-lg font-bold text-[#1B2A41]">Total Amount</span>
            <span className="text-2xl font-bold text-[#1B2A41]">₹{totalAmount}</span>
          </div>

          {/* Payment Badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
            <p className="text-green-700 text-sm font-medium">✓ 100% Secure</p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            className="
              w-full py-3 rounded-xl text-white font-semibold text-lg
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              hover:opacity-90 transition shadow-md
            "
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
