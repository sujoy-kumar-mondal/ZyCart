import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../context/SettingsProvider";

const About = () => {
  const { settings } = useSettings();
  const brandName = settings?.platformName || "ZyCart";
  const tagline = settings?.tagline || "Easy Shop, Easy Life";

  useEffect(() => {
    document.title = `About Us | ${brandName}`;
  }, [brandName]);

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-black text-slate-900">About {brandName}</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          {tagline} — Your trusted multi-seller online marketplace built with modern
          technology and a seamless user experience at its core.
        </p>
      </motion.div>

      {/* Our Story */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 border border-slate-200/80"
      >
        <h2 className="text-3xl font-black text-slate-900 mb-4">Our Story</h2>
        <p className="text-slate-600 leading-relaxed text-lg font-medium">
          {brandName} was founded with a vision to revolutionize online shopping by
          creating a seamless marketplace that connects users with multiple
          sellers. We believe in transparency, quality, and customer
          satisfaction as the cornerstones of our business. Our platform is
          built on cutting-edge MERN stack technology to ensure reliability,
          scalability, and an exceptional user experience.
        </p>
      </motion.section>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-50/60 to-orange-50/40 rounded-3xl p-8 border border-slate-200/80"
        >
          <h3 className="text-2xl font-black text-slate-900 mb-3">Our Mission</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            To empower users and sellers by providing a trusted, user-friendly
            e-commerce platform that offers a wide range of quality products at
            competitive prices with exceptional service.
          </p>
        </motion.div>

        {/* Vision */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-50/60 to-orange-50/40 rounded-3xl p-8 border border-slate-200/80"
        >
          <h3 className="text-2xl font-black text-slate-900 mb-3">Our Vision</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            To become the most reliable and customer-centric multi-seller
            marketplace in the region, setting the standard for innovation,
            trust, and excellence in e-commerce.
          </p>
        </motion.div>
      </div>

      {/* Why Choose Us */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 border border-slate-200/80"
      >
        <h2 className="text-3xl font-black text-slate-900 mb-8">Why Choose {brandName}?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Wide Selection</h4>
            <p className="text-slate-600 font-medium text-sm">
              Access to thousands of products from multiple trusted sellers all
              in one place.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Secure & Safe</h4>
            <p className="text-slate-600 font-medium text-sm">
              Advanced security measures protect your data and transactions with
              industry-leading encryption.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Best Prices</h4>
            <p className="text-slate-600 font-medium text-sm">
              Competitive pricing and frequent deals to ensure you get the best
              value for your money.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Fast Delivery</h4>
            <p className="text-slate-600 font-medium text-sm">
              Quick and reliable shipping options to get your orders delivered
              right to your door.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">24/7 Support</h4>
            <p className="text-slate-600 font-medium text-sm">
              Our dedicated customer support team is always ready to help with
              any questions or concerns.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Easy Returns</h4>
            <p className="text-slate-600 font-medium text-sm">
              Hassle-free return and exchange policy to ensure your complete
              satisfaction.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-slate-900 via-[#1E293B] to-slate-900 border border-slate-800 rounded-3xl shadow-xl p-8 sm:p-10 text-white"
      >
        <h2 className="text-3xl font-black mb-6">Powered by Modern Technology</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-extrabold mb-3 text-blue-400">Frontend</h4>
            <ul className="space-y-2 text-sm opacity-90 font-medium">
              <li>⚛️ React.js - Modern UI Library</li>
              <li>🎨 Tailwind CSS - Utility-First Styling</li>
              <li>✨ Framer Motion - Smooth Animations</li>
              <li>🔔 React Hot Toast - Notifications</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-extrabold mb-3 text-orange-400">Backend</h4>
            <ul className="space-y-2 text-sm opacity-90 font-medium">
              <li>🚀 Node.js &amp; Express - Server Framework</li>
              <li>🗄️ MongoDB - Database</li>
              <li>🔐 JWT - Authentication</li>
              <li>☁️ Cloudinary - Image Storage</li>
            </ul>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
