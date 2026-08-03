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
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    document.title = "ZyCart Seller - Start Your Online Business Today";
  }, []);

  const features = [
    {
      id: 1,
      title: "Easy Store Setup",
      description: "Launch your online store in minutes with our simple setup process",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
    },
    {
      id: 2,
      title: "Powerful Analytics",
      description: "Track sales, customer behavior, and business growth with real-time dashboards",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 3,
      title: "Secure Payments",
      description: "Get paid securely with multiple payment options and instant settlements",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 4,
      title: "Wide Reach",
      description: "Access millions of customers and expand your business globally",
      icon: Globe,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 5,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated seller support team",
      icon: Users,
      color: "from-red-500 to-rose-500",
    },
    {
      id: 6,
      title: "Marketing Tools",
      description: "Boost sales with built-in promotions, discounts, and marketing features",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Electronics Seller",
      rating: 5,
      text: "ZyCart has helped me increase my sales by 300%. The dashboard is intuitive and the support team is amazing!",
      avatar: "🧑‍💼",
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      role: "Fashion Entrepreneur",
      rating: 5,
      text: "Best platform to sell online. The commission rates are fair and the payment system is reliable.",
      avatar: "👩‍💼",
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Home Goods Trader",
      rating: 5,
      text: "Love the simplicity and the analytics features. I can monitor my store performance in real-time!",
      avatar: "👨‍💼",
    },
  ];

  const stats = [
    { label: "Active Sellers", value: "5,000+", icon: Users },
    { label: "Products Listed", value: "100,000+", icon: TrendingUp },
    { label: "Daily Customers", value: "50,000+", icon: Globe },
    { label: "Success Rate", value: "98%", icon: CheckCircle },
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
                Start Selling <span className="text-indigo-600">Today</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of successful sellers on ZyCart. Reach millions of customers, 
                grow your business, and maximize your earnings with our powerful seller platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/seller/apply"
                  className="bg-linear-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-indigo-50 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>

              <p className="text-sm text-gray-500">No credit card required • Free to apply</p>
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
                        <p className="text-2xl font-bold text-indigo-600">$50K+</p>
                        <p className="text-xs text-gray-600 mt-1">Monthly Earnings</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">1000+</p>
                        <p className="text-xs text-gray-600 mt-1">Orders</p>
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
              Why Choose ZyCart?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to run a successful online store
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

        {/* ⭐ TESTIMONIALS SECTION */}
        <section className="py-20 bg-white border-y border-gray-200">
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#1B2A41] mb-4">
                Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Hear from our successful sellers around the world
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-[#1B2A41]">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </motion.div>
              ))}
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
          <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-2xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
              Join thousands of sellers who are growing their business on ZyCart today
            </p>
            <Link
              to="/seller/apply"
              className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Apply as a Seller Now
            </Link>
          </div>
        </motion.section>

        {/* 📝 INFO SECTION */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
              >
                <h3 className="text-xl font-bold text-[#1B2A41] mb-3">Zero Commissions</h3>
                <p className="text-gray-600">
                  Start selling with zero commission for the first 3 months. Only then do you pay our industry-leading rates.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-xl font-bold text-[#1B2A41] mb-3">Fast Payouts</h3>
                <p className="text-gray-600">
                  Get paid every week directly to your bank account. No waiting, no complications.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold text-[#1B2A41] mb-3">Full Support</h3>
                <p className="text-gray-600">
                  Our dedicated seller support team is here to help you succeed every step of the way.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
