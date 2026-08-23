import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Users,
  Zap,
  Globe,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  Store
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";

const Home = () => {
  const { user } = useAuth();
  const { settings, stats } = useSettings();
  const brandName = settings?.platformName || "ZyCart";
  const commissionRate = settings?.platformCommissionRate ?? 5;
  const sellerCut = 100 - commissionRate;

  useEffect(() => {
    document.title = `Become a Seller | ${brandName} Merchant Network`;
  }, [brandName]);

  const features = [
    {
      id: 1,
      title: "Doorstep Courier Pickup",
      description: "Automated logistics integration with verified courier partners directly from your warehouse.",
      icon: Truck,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: 2,
      title: "Fast Weekly Settlements",
      description: `Guaranteed payouts directly to your bank account with transparent ${commissionRate}% platform cuts and ${sellerCut}% seller payouts.`,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: 3,
      title: "Category Attribute Mapping",
      description: "Rich dynamic technical specifications tailored specifically for electronics, clothing, and home essentials.",
      icon: Layers,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: 4,
      title: "GSTIN Verification & Protection",
      description: "Compliant verified merchant network protecting your brand identity against counterfeits.",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: 5,
      title: "2FA Merchant Store Security",
      description: "Time-based one-time password verification on all sensitive product edits and account access.",
      icon: Lock,
      color: "from-red-500 to-rose-600",
    },
    {
      id: 6,
      title: "Promotional Discount Engine",
      description: "Set custom discount percentages and expiry timers to supercharge conversion rates.",
      icon: TrendingUp,
      color: "from-blue-600 to-[#3F51F4]",
    },
  ];

  const liveStats = [
    { label: "Verified Merchants", value: `${stats?.verifiedSellers?.toLocaleString() || 0}`, icon: Store },
    { label: "Catalog Listings", value: `${stats?.activeProducts?.toLocaleString() || 0}`, icon: TrendingUp },
    { label: "Active Buyers", value: `${stats?.happyShoppers?.toLocaleString() || 0}`, icon: Users },
    { label: "Order Delivery Rate", value: stats?.deliverySuccessRate || "99.4%", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" /> Scale Your Business Across India
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#1B2A41] leading-tight">
                Grow Your Brand on{" "}
                <span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                  {brandName} Merchant
                </span>
              </h1>

              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Reach over {stats?.happyShoppers > 0 ? `${stats.happyShoppers.toLocaleString()} active shoppers` : "thousands of active shoppers"}. Enjoy {sellerCut}% payouts, automated doorstep logistics pickup, zero listing fee barriers, and live multi-channel analytics.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to={user ? "/seller/dashboard" : "/seller/apply"}
                  className="px-8 py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-xl shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {user ? "Open Merchant Dashboard" : "Apply as Seller Free"} <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to={user ? "/seller/dashboard" : "/login"}
                  className="px-8 py-4 rounded-2xl font-extrabold text-[#3F51F4] bg-white border-2 border-blue-200/80 hover:bg-blue-50 transition shadow-xs flex items-center justify-center gap-2"
                >
                  {user ? "Manage Store" : "Sign In to Store"}
                </Link>
              </div>
            </motion.div>

            {/* Right Showcase Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1B2A41]">Merchant Growth Stats</h3>
                      <p className="text-xs text-slate-500">Live platform network data</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-3xl font-black text-[#3F51F4]">{sellerCut}%</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Net Seller Cut</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-3xl font-black text-emerald-600">Weekly</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Bank Settlements</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {liveStats.map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div key={idx} className="text-center space-y-1">
                  <IconComp className="w-7 h-7 text-[#3F51F4] mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-black text-[#1B2A41]">{stat.value}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2A41]">Why Sell With ZyCart?</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Built from the ground up for high-growth e-commerce merchants.
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

    </div>
  );
};

export default Home;
