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
  Sparkles,
  Award,
  TrendingUp,
  Store,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsProvider";

const Home = () => {
  const { settings, stats } = useSettings();
  const brandName = settings?.platformName || "ZyCart";
  const tagline = settings?.tagline || "Easy Shop, Easy Life";

  useEffect(() => {
    document.title = `${brandName} — ${tagline}`;
  }, [brandName, tagline]);

  const features = [
    {
      id: 1,
      title: "Doorstep Express Delivery",
      description: `Fast and secure shipment delivered in ${settings?.estimatedDeliveryDays || "3-5 Business Days"}.`,
      icon: Truck,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: 2,
      title: "Direct Verified Merchants",
      description: "Shop directly from authenticated multi-vendor sellers across categories.",
      icon: Store,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: 3,
      title: "Safe & Encrypted Payments",
      description: "End-to-end secured checkouts with full fraud protection.",
      icon: Shield,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: 4,
      title: "24/7 Dedicated Support",
      description: `Email us anytime at ${settings?.supportEmail || "support@zycart.com"}.`,
      icon: Headphones,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: 5,
      title: "Transparent Pricing",
      description: "Zero hidden charges with flat low delivery and free shipping perks.",
      icon: Sparkles,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: 6,
      title: "Verified Reviews",
      description: "Read genuine feedback and ratings from verified buyers.",
      icon: CheckCircle,
      color: "from-blue-600 to-[#3F51F4]",
    },
  ];

  const liveStats = [
    { label: "Active Products", value: `${stats?.activeProducts?.toLocaleString() || 0}`, icon: ShoppingCart },
    { label: "Verified Sellers", value: `${stats?.verifiedSellers?.toLocaleString() || 0}`, icon: Star },
    { label: "Orders Shipped", value: `${stats?.ordersShipped?.toLocaleString() || 0}`, icon: Truck },
    { label: "Happy Shoppers", value: `${stats?.happyShoppers?.toLocaleString() || 0}`, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative py-10 sm:py-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC] overflow-hidden w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-5 sm:space-y-6 w-full max-w-full"
            >

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1B2A41] leading-tight break-words">
                {tagline.includes(",") ? (
                  <>
                    {tagline.split(",")[0]},{" "}
                    <span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                      {tagline.split(",").slice(1).join(",")}
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                    {tagline}
                  </span>
                )}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Experience a smooth e-commerce catalog with thousands of verified products, transparent price drops, express shipping, and buyer protection.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-white text-sm sm:text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-xl shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  Explore Catalog <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-extrabold text-[#3F51F4] bg-white border-2 border-blue-200/80 hover:bg-blue-50 hover:border-blue-300 transition shadow-xs flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <TrendingUp className="w-5 h-5" /> Hot Trends
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs font-bold text-slate-500 border-t border-slate-200/60">
                <span className="flex items-center gap-1.5 whitespace-nowrap"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Verified Sellers</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Instant Checkout</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Easy Returns</span>
              </div>
            </motion.div>

            {/* Right Graphic Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative w-full max-w-full"
            >
              <div className="relative bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200/80 space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#1B2A41]">Featured Store Highlights</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500">Live inventory analytics</p>
                    </div>
                  </div>
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase shrink-0">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center">
                    <p className="text-2xl sm:text-3xl font-black text-[#3F51F4]">{stats?.activeProducts?.toLocaleString() || 0}</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Products Listed</p>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats?.verifiedSellers?.toLocaleString() || 0}</p>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">Brand Merchants</p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      stats?.reviewCount > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"
                    }`}>
                      ★
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1B2A41] truncate">Buyer Satisfaction Score</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {stats?.reviewCount > 0
                          ? `Based on ${stats.reviewCount.toLocaleString()} verified review${stats.reviewCount > 1 ? "s" : ""}`
                          : "Be the first to review a product"}
                      </p>
                    </div>
                  </div>
                  <span className={`font-black shrink-0 ${stats?.reviewCount > 0 ? "text-sm text-slate-900" : "text-slate-500 text-[11px] sm:text-xs"}`}>
                    {stats?.reviewCount > 0 ? stats.buyerSatisfactionScore : "No reviews yet"}
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS CAROUSELS */}
      <section id="trending" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <TrendsSlider type="purchase" title="🏆 Top Trending Purchases" />
        <TrendsSlider type="views" title="🔥 Most Viewed Products" />
      </section>

      {/* STATS STRIP */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {liveStats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="text-center space-y-2">
                  <IconComponent className="w-6 h-6 mx-auto text-[#3F51F4]" />
                  <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY SHOP WITH US */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2A41]">Why Shop With {brandName}?</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Designed for buyers who value transparent pricing, verified merchants, and quick delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 hover:shadow-xl transition duration-300 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} text-white flex items-center justify-center shadow-md`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#1B2A41] group-hover:text-[#3F51F4] transition">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl space-y-6 relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black leading-tight">
            Ready to Find Your Next Favorite Product?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
            Explore thousands of products across electronics, fashion, home decor, and smart gadgets.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#3F51F4] rounded-2xl font-extrabold text-base hover:bg-blue-50 shadow-lg transition transform active:scale-95"
            >
              Start Shopping Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
