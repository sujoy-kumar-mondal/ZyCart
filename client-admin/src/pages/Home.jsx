import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Shield,
  BarChart3,
  Lock,
  Globe,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Store,
  Layers
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
    document.title = `${brandName} Operations Hub — Executive Administration`;
  }, [brandName]);

  const features = [
    {
      id: 1,
      title: "Merchant Verification & Approvals",
      description: "Review seller applications, inspect GST documents, and activate verified merchant accounts.",
      icon: ShieldCheck,
      color: "from-rose-500 to-red-600",
    },
    {
      id: 2,
      title: "Dynamic Taxonomy & Attributes",
      description: "Manage hierarchical categories and configure category-specific technical schemas.",
      icon: Layers,
      color: "from-pink-500 to-rose-600",
    },
    {
      id: 3,
      title: "Commission Splits & Payouts",
      description: "Configure dynamic commission percentages and monitor platform fee splits.",
      icon: BarChart3,
      color: "from-red-500 to-amber-600",
    },
    {
      id: 4,
      title: "Customer Ban & Account Controls",
      description: "Monitor customer accounts and restrict access for policy violations.",
      icon: Users,
      color: "from-rose-400 to-red-500",
    },
    {
      id: 5,
      title: "Global Multi-Package Audits",
      description: "Inspect parent orders and track itemized sub-packages across merchants.",
      icon: TrendingUp,
      color: "from-red-600 to-rose-700",
    },
    {
      id: 6,
      title: "Encrypted Security Auditing",
      description: "256-bit administrative channel encryption and full operation logging.",
      icon: Lock,
      color: "from-rose-600 to-red-800",
    },
  ];

  const liveStats = [
    { label: "Shoppers Registered", value: `${stats?.happyShoppers?.toLocaleString() || 0}`, icon: Users },
    { label: "Verified Merchants", value: `${stats?.verifiedSellers?.toLocaleString() || 0}`, icon: Store },
    { label: "Orders Fulfilled", value: `${stats?.ordersFulfilled?.toLocaleString() || 0}`, icon: CheckCircle },
    { label: "System Uptime", value: stats?.systemUptime || "99.99%", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-rose-50/70 via-slate-50 to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/90 border border-rose-300 text-rose-900 text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-4 h-4 text-rose-600" /> Executive Administrative Suite
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight">
                Enterprise Command Center for{" "}
                <span className="bg-gradient-to-r from-[#EF4444] via-[#F43F5E] to-[#BE123C] text-transparent bg-clip-text">
                  {brandName} Marketplace
                </span>
              </h1>

              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Oversee customer accounts, verify merchant GST credentials, audit platform revenue splits ({commissionRate}% platform cut / {sellerCut}% merchant cut), and configure sub-admin role permissions.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to={user ? "/admin/dashboard" : "/login"}
                  className="px-8 py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#F87171] via-[#EF4444] to-[#E11D48] hover:from-[#EF4444] hover:to-[#BE123C] shadow-xl shadow-red-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {user ? "Open Executive Dashboard" : "Admin Portal Sign In"} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>

            {/* Right Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-red-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">Operations Summary</h3>
                      <p className="text-xs text-slate-500">Live platform metrics</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 text-center">
                    <p className="text-3xl font-black text-rose-600">{sellerCut}%</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Merchant Payout Rate</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 text-center">
                    <p className="text-3xl font-black text-red-600">{commissionRate}%</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Platform Cut Audit</p>
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
                  <IconComp className="w-7 h-7 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</p>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Administrative Capabilities</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Comprehensive platform controls for full operational oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-rose-200 transition duration-300 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} text-white flex items-center justify-center shadow-md`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-red-600 transition">
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
