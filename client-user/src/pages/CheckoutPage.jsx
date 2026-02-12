import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import axios from "../utils/axiosInstance.js";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.state || !address.postalCode) {
      alert("Please fill all address fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/orders/place", {
        items: cartItems,
        address,
      });

      if (res.data.success) {
        // Update purchase trends for each item if user role is "user"
        if (user?.role === "user") {
          for (const item of cartItems) {
            await axios.post("/products/update-trend-purchase", {
              productId: item.productId,
              quantity: item.qty,
            });
          }
        }

        // Don't clear cart yet - wait for payment confirmation
        // Redirect to payment page
        navigate("/payment", { 
          state: { 
            orderId: res.data.order._id,
            totalAmount: totalPrice,
            cartItems: cartItems 
          } 
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Order failed!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.title = "Checkout | ZyCart";
    
    // Load user's saved address from database
    const loadUserAddress = async () => {
      try {
        const res = await axios.get("/users/profile");
        if (res.data.success && res.data.user?.address) {
          setAddress(res.data.user.address);
        }
      } catch (error) {
      }
    };
    
    loadUserAddress();
  }, []);

  if (loading) return <Loader />;

  if (!cartItems.length) {
    return (
      <div className="text-center text-gray-600 py-20 text-lg">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 grid md:grid-cols-3 gap-10">

      {/* LEFT: ADDRESS FORM */}
      <div
        className="
          md:col-span-2 bg-white shadow-xl rounded-2xl p-8
          border border-[#8FD6F6]/40
        "
      >
        <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">
          Delivery Address
        </h2>

        <div className="space-y-5">
          {/* Address Line 1 */}
          <div>
            <label className="font-medium text-[#1B2A41]">Address Line 1</label>
            <input
              type="text"
              name="line1"
              value={address.line1}
              onChange={handleChange}
              placeholder="House no, street..."
              className="
                w-full mt-2 px-4 py-3 rounded-xl
                bg-[#F7FBFF] border border-[#8FD6F6]/40
                text-[#1B2A41] placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                transition
              "
            />
          </div>

          {/* City */}
          <div>
            <label className="font-medium text-[#1B2A41]">City</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              className="
                w-full mt-2 px-4 py-3 rounded-xl
                bg-[#F7FBFF] border border-[#8FD6F6]/40
                text-[#1B2A41] placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                transition
              "
            />
          </div>

          {/* State + Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="font-medium text-[#1B2A41]">State</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="font-medium text-[#1B2A41]">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={address.postalCode}
                onChange={handleChange}
                className="
                  w-full mt-2 px-4 py-3 rounded-xl
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: ORDER SUMMARY */}
      <div
        className="
          bg-white shadow-xl rounded-2xl p-8 h-fit
          border border-[#8FD6F6]/40
        "
      >
        <h2 className="text-xl font-bold text-[#1B2A41] mb-4">
          Order Summary
        </h2>

        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between text-lg">
            <span>Total Items:</span>
            <span className="font-semibold text-[#1B2A41]">
              {cartItems.length}
            </span>
          </div>

          <div className="flex justify-between font-bold text-xl pt-2">
            <span>Total Amount:</span>
            <span className="text-[#1B2A41]">₹{totalPrice}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="
            w-full py-3 mt-6 rounded-xl text-white font-semibold
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            hover:opacity-90 transition shadow-md text-lg
          "
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
