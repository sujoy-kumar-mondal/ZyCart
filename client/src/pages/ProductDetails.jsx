import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance.js";
import Loader from "../components/Loader";
import { useCart } from "../context/CartProvider";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthProvider";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const role = user?.role;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error("Error loading product", error);
        toast.error("Failed to load product!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Update title
  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} | ZyCart`;
    }
  }, [product]);

  // UI return (hooks above only)
  if (loading) return <Loader />;

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 py-20 text-lg"
      >
        Product not found.
      </motion.div>
    );
  }

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto px-14 py-16 grid md:grid-cols-2 gap-12">
        {/* PRODUCT IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-[#8FD6F6]/40 overflow-hidden"
        >
          <img
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            className="w-full h-[430px] object-cover"
          />
        </motion.div>

        {/* INFO PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl font-extrabold text-[#1B2A41] leading-tight">
            {product.title}
          </h1>

          <p className="text-3xl font-extrabold bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-transparent bg-clip-text">
            ₹{product.price}
          </p>

          <p className="text-gray-700 text-lg">
            Stock:{" "}
            <span
              className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
            >
              {product.stock}
            </span>
          </p>

          <p className="text-gray-600 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* ADD TO CART */}
          {role === "user" && (<motion.button
            whileTap={{ scale: 0.93 }}
            disabled={product.stock === 0}
            onClick={() => {
              product.isAvailable ? addToCart(product) : null;
              toast.success("Added to cart!");
            }}
            className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition ${product.isAvailable ? product.stock === 0
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-white hover:opacity-90"
              : "bg-gray-300 cursor-not-allowed text-gray-600"
              }`}
          >
            {product.isAvailable ? product.stock === 0 ? "Out of Stock" : "Add to Cart" : "Unavailable"}
          </motion.button>)
          }
        </motion.div>
      </div>
    </>
  );
};

export default ProductDetails;
