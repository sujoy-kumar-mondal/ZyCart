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
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    document.title = "ZyCart Admin - Platform Management";
  }, []);

  const features = [
    {
      id: 1,
      title: "User Management",
      description: "Monitor, manage, and oversee all user accounts and activities across the platform",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Seller Verification",
      description: "Review and approve seller applications with comprehensive verification tools",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Advanced Analytics",
      description: "Track platform metrics, sales trends, and user behavior with detailed analytics",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      title: "Security Control",
      description: "Maintain platform security with role-based access control and monitoring",
      icon: Shield,
      color: "from-red-500 to-rose-500",
    },
    {
      id: 5,
      title: "Order Management",
      description: "Oversee all orders, disputes, and transactions happening on the platform",
      icon: TrendingUp,
      color: "from-orange-500 to-amber-500",
    },
    {
      id: 6,
      title: "System Control",
      description: "Full control over categories, attributes, and platform configurations",
      icon: Lock,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const stats = [
    { label: "Total Users", value: "10,000+", icon: Users },
    { label: "Active Sellers", value: "5,000+", icon: TrendingUp },
    { label: "Daily Orders", value: "5,000+", icon: CheckCircle },
    { label: "Platform Uptime", value: "99.9%", icon: Shield },
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
                ZyCart <span className="text-red-600">Admin</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Powerful platform management tools to oversee users, sellers, orders, and transactions. 
                Complete control over your multi-seller marketplace with advanced analytics and security features.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/login"
                  className="bg-linear-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Admin Login <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => alert("Admin accounts are created via API only. Contact system administrator.")}
                  className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-50 transition-all duration-300"
                >
                  Contact Support
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Admin accounts are managed by system administrators via API
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-xl p-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-linear-to-r from-red-200 to-red-300 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-red-100 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">10K+</p>
                        <p className="text-xs text-gray-600 mt-1">Total Users</p>
                      </div>
                      <div className="bg-red-100 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">5K+</p>
                        <p className="text-xs text-gray-600 mt-1">Sellers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 📊 STATS SECTION */}
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
                      <IconComponent className="w-8 h-8 text-red-600" />
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

        {/* ✨ FEATURES SECTION */}
        <section className="py-20 max-w-screen-2xl container mx-auto px-4 md:px-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#1B2A41] mb-4">
              Complete Admin Control
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage a successful multi-seller marketplace
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
                  <div className={`bg-linear-to-br ${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
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

        {/* 🔐 SECURITY SECTION */}
        <section className="py-20 bg-linear-to-r from-red-50 to-orange-50 border-y border-red-200">
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#1B2A41] mb-4">
                Security First
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enterprise-grade security and compliance features
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="bg-white rounded-lg p-6 border-l-4 border-red-600"
              >
                <h3 className="text-lg font-bold text-[#1B2A41] mb-2">Role-Based Access</h3>
                <p className="text-gray-600">
                  Fine-grained access control and permission management for different admin roles.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-6 border-l-4 border-red-600"
              >
                <h3 className="text-lg font-bold text-[#1B2A41] mb-2">Audit Logging</h3>
                <p className="text-gray-600">
                  Complete audit trails for all admin actions and platform transactions.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg p-6 border-l-4 border-red-600"
              >
                <h3 className="text-lg font-bold text-[#1B2A41] mb-2">Data Protection</h3>
                <p className="text-gray-600">
                  State-of-the-art encryption and compliance with data protection standards.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 🚀 CTA SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 max-w-screen-2xl container mx-auto px-4 md:px-14"
        >
          <div className="bg-linear-to-r from-red-600 to-red-700 rounded-2xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Manage Your Platform?
            </h2>
            <p className="text-xl text-red-100 max-w-2xl mx-auto mb-8">
              Login to your admin dashboard and take control of your multi-seller marketplace
            </p>
            <Link
              to="/login"
              className="inline-block bg-white text-red-600 px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Go to Admin Login
            </Link>
          </div>
        </motion.section>

        {/* 📝 API INFO SECTION */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-[#1B2A41] mb-4">Admin Registration</h3>
              <p className="text-gray-600 mb-4">
                Admin accounts are created exclusively through API endpoints by system administrators. 
                This ensures strict control over who gets administrative access to the platform.
              </p>
              <p className="text-sm text-gray-500">
                For account creation requests, please contact your system administrator with appropriate credentials and authorization.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
