import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";
import ProductList from "../components/ProductList";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Error loading products", error);
      toast.error("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    document.title = "Home | ZyCart";
  }, []);

  return (
    <>
      <div
        className="
        min-h-screen py-12 max-w-screen-2xl container mx-auto px-14
        bg-linear-to-br from-[#C3F2EC] via-[#8FD6F6] to-[#3F51F4]
      "
      >
        <div className="">

          {/* ✨ HERO SECTION */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="
            bg-white shadow-xl rounded-2xl
            p-10 md:p-14 text-center
            border border-[#8FD6F6]/40
          "
          >
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1B2A41]"
            >
              Welcome to ZyCart
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-gray-700"
            >
              Discover a seamless shopping experience powered by a modern
              multi-supplier MERN marketplace.
            </motion.p>
          </motion.section>

          {/* 🛒 Latest Products */}
          <section>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold mb-6 tracking-tight text-[#1B2A41]"
            >
              Latest Products
            </motion.h2>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ProductList products={products} />
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
