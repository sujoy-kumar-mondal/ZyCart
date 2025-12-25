import React, { useEffect } from "react";
import TrendsSlider from "../components/TrendsSlider";
import { motion } from "framer-motion";

const Home = () => {
  useEffect(() => {
    document.title = "Home | ZyCart";
  }, []);

  return (
    <>
      <div
        className="
        min-h-screen py-12 max-w-screen-2xl container mx-auto px-4 md:px-14
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

          {/* 🛒 Trending by Purchase */}
          <TrendsSlider type="purchase" title="🏆 Trending by Purchases" />

          {/* 👁️ Trending by Views */}
          <TrendsSlider type="views" title="🔥 Trending by Views" />
        </div>
      </div>
    </>
  );
};

export default Home;
