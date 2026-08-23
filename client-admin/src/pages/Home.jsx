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
  Store
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useSettings } from "../context/SettingsProvider";

const Home = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const brandName = settings?.platformName || "ZyCart";
  const commissionRate = settings?.platformCommissionRate ?? 5;
  const sellerCut = Math.max(0, 100 - commissionRate);

  useEffect(() => {
    document.title = `${brandName} Admin — Enterprise Platform Command Center`;
  }, [brandName]);

  const features = [
    {
      id: 1,
      title: "Merchant Verification & Approvals",
      description: "Inspect GSTIN, PAN, and business credentials before approving seller accounts.",
      icon: CheckCircle,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: 2,
      title: "Sub-Admin Granular Permissions",
      description: "Assign role-based access for sellers, customer directory, or order audits.",
      icon: ShieldCheck,
      color: "from-[#3F51F4] to-blue-600",
    },
    {
      id: 3,
      title: "Platform Revenue & Split Audits",
      description: `Real-time auditing of ${commissionRate}% platform commission cuts and ${sellerCut}% seller payouts.`,
      icon: BarChart3,
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: 4,
      title: "Customer Ban & Account Controls",
      description: "Monitor customer accounts and restrict access for policy violations.",
      icon: Users,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: 5,
      title: "Global Multi-Package Audits",
      description: "Inspect parent orders and track itemized sub-packages across merchants.",
      icon: TrendingUp,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: 6,
      title: "Encrypted Security Auditing",
      description: "256-bit administrative channel encryption and full operation logging.",
      icon: Lock,
      color: "from-[#1B2A41] to-slate-900",
    },
  ];

  const stats = [
    { label: "Shoppers Registered", value: "10,000+", icon: Users },
    { label: "Verified Merchants", value: "5,000+", icon: Store },
    { label: "Orders Fulfilled", value: "50,000+", icon: CheckCircle },
    { label: "System Uptime", value: "99.99%", icon: Shield },
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
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" /> Executive Administrative Suite
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-[#1B2A41] leading-tight">
                Enterprise Command Center for{" "}
                <span className="bg-gradient-to-r from-[#3F51F4] to-[#6A8EF0] text-transparent bg-clip-text">
                  {brandName} Marketplace
                </span>
              </h1>

              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                Oversee customer accounts, verify merchant GST credentials, audit platform revenue splits ({commissionRate}% platform cut / {sellerCut}% merchant cut), and configure sub-admin role permissions.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to={user ? "/admin/dashboard" : "/login"}
                  className="px-8 py-4 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-[#6A8EF0] to-[#3F51F4] hover:opacity-95 shadow-xl shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
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
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#3F51F4] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#1B2A41]">Platform Security</h3>
                      <p className="text-xs text-slate-500">Sub-Admin Permission Matrix</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                    <p className="text-3xl font-black text-purple-600">Super</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">Role Privileges</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <p className="text-3xl font-black text-emerald-600">20%</p>
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
            {stats.map((stat, idx) => {
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1B2A41]">Administrative Capabilities</h2>
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
