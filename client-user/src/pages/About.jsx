import React, { useEffect } from "react";
import { motion } from "framer-motion";

const About = () => {
  useEffect(() => {
    document.title = "About Us | ZyCart";
  }, []);

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 space-y-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-extrabold text-[#1B2A41]">About ZyCart</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted multi-seller online marketplace built with modern
          technology and a seamless user experience at its core.
        </p>
      </motion.div>

      {/* Our Story */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40"
      >
        <h2 className="text-3xl font-bold text-[#1B2A41] mb-4">Our Story</h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          ZyCart was founded with a vision to revolutionize online shopping by
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
          className="bg-linear-to-br from-[#6A8EF0]/10 to-[#3F51F4]/10 rounded-2xl p-8 border border-[#8FD6F6]/40"
        >
          <h3 className="text-2xl font-bold text-[#1B2A41] mb-3">Our Mission</h3>
          <p className="text-gray-700 leading-relaxed">
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
          className="bg-linear-to-br from-[#6A8EF0]/10 to-[#3F51F4]/10 rounded-2xl p-8 border border-[#8FD6F6]/40"
        >
          <h3 className="text-2xl font-bold text-[#1B2A41] mb-3">Our Vision</h3>
          <p className="text-gray-700 leading-relaxed">
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
        className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40"
      >
        <h2 className="text-3xl font-bold text-[#1B2A41] mb-8">Why Choose ZyCart?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">Wide Selection</h4>
            <p className="text-gray-600">
              Access to thousands of products from multiple trusted sellers all
              in one place.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">Secure & Safe</h4>
            <p className="text-gray-600">
              Advanced security measures protect your data and transactions with
              industry-leading encryption.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">Best Prices</h4>
            <p className="text-gray-600">
              Competitive pricing and frequent deals to ensure you get the best
              value for your money.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">Fast Delivery</h4>
            <p className="text-gray-600">
              Quick and reliable shipping options to get your orders delivered
              right to your door.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">24/7 Support</h4>
            <p className="text-gray-600">
              Our dedicated customer support team is always ready to help with
              any questions or concerns.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
            <h4 className="text-lg font-semibold text-[#1B2A41]">Easy Returns</h4>
            <p className="text-gray-600">
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
        className="bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-2xl shadow-lg p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-6">Powered by Modern Technology</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-3">Frontend</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>⚛️ React.js - Modern UI Library</li>
              <li>🎨 Tailwind CSS - Utility-First Styling</li>
              <li>✨ Framer Motion - Smooth Animations</li>
              <li>🔔 React Hot Toast - Notifications</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Backend</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>🚀 Node.js & Express - Server Framework</li>
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
