import React, { useEffect } from "react";
import TrendsSlider from "../components/TrendsSlider";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Truck,
  Shield,
  Zap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    document.title = "ZyCart: Easy Shop, Easy Life";
  }, []);

  const features = [
    {
      id: 1,
      title: "Wide Selection",
      description: "Browse thousands of products from verified sellers",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Secure Payment",
      description: "Multiple payment options with buyer protection",
      icon: Shield,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      title: "Best Prices",
      description: "Competitive pricing with regular discounts and deals",
      icon: Zap,
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      title: "Wishlist & Reviews",
      description: "Save favorite items and read genuine customer reviews",
      icon: Heart,
      color: "from-red-500 to-rose-500",
    },
    {
      id: 6,
      title: "Money Back Guarantee",
      description: "Easy returns and refunds if you're not satisfied",
      icon: CheckCircle,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const stats = [
    { label: "Products", value: "100,000+", icon: ShoppingCart },
    { label: "Sellers", value: "5,000+", icon: Star },
    { label: "Daily Orders", value: "50,000+", icon: Truck },
    { label: "Happy Customers", value: "1M+", icon: Heart },
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-[#F0F4F8] via-[#E8F1F8] to-[#E0F0F8]">
        {/* 🎯 HERO SECTION */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20 max-w-screen-2xl container mx-auto px-4 md:px-14"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-[#1B2A41] leading-tight mb-6">
                Easy Shop,{" "}
                <span className="text-indigo-600">Easy Life</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover a seamless shopping experience with thousands of products 
                from verified sellers. Enjoy secure payments, fast delivery, and 
                unbeatable prices all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/products"
                  className="bg-linear-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Shopping <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => document.getElementById('trending').scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-all duration-300"
                >
                  See Trending
                </button>
              </div>

              <p className="text-sm text-gray-500">
                ✓ Secure checkout • ✓ Fast delivery • ✓ Money-back guarantee
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="bg-linear-to-br from-indigo-500 to-blue-500 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-xl p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-linear-to-r from-indigo-200 to-blue-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-indigo-100 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-indigo-600">100K+</p>
                        <p className="text-xs text-gray-600 mt-1">Products</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">5K+</p>
                        <p className="text-xs text-gray-600 mt-1">Sellers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* � TRENDING PRODUCTS SECTION */}
        <section id="trending" className="py-20 bg-linear-to-b from-white to-gray-50">
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            {/* Trending by Purchase */}
            <TrendsSlider type="purchase" title="🏆 Trending by Purchases" />

            {/* Trending by Views */}
            <TrendsSlider type="views" title="🔥 Trending by Views" />
          </div>
        </section>

        {/* �📊 STATS SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-16 bg-white border-y border-gray-200"
        >
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-3">
                      <IconComponent className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-[#1B2A41]">
                      {stat.value}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ✨ WHY SHOP WITH US */}
        <section className="py-20 max-w-screen-2xl container mx-auto px-4 md:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B2A41] mb-4">
              Why Shop With ZyCart?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The best online shopping destination for quality, variety, and value
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div
                    className={`bg-linear-to-br ${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1B2A41] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/*  CTA SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 max-w-screen-2xl container mx-auto px-4 md:px-14"
        >
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Product?
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              Join millions of satisfied customers shopping on ZyCart today
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Explore Now
            </Link>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default Home;
