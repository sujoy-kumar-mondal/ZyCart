import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | ZyCart";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Thank you! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 py-16 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-extrabold text-[#1B2A41]">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have a question? We'd love to hear from you. Get in touch with our
          team anytime.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40">
            <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">
              Get In Touch
            </h2>

            {/* Email */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">✉️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A41]">Email</h4>
                  <p className="text-gray-600">support@zycart.com</p>
                  <p className="text-gray-600">info@zycart.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">📞</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A41]">Phone</h4>
                  <p className="text-gray-600">+91 1234 567 890</p>
                  <p className="text-gray-600">+91 0987 654 321</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A41]">Address</h4>
                  <p className="text-gray-600">
                    123 Tech Street, Innovation Hub
                    <br />
                    New Delhi, Delhi 110001
                    <br />
                    India
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">🕐</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2A41]">Business Hours</h4>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-linear-to-r from-[#6A8EF0]/10 to-[#3F51F4]/10 rounded-2xl p-8 border border-[#8FD6F6]/40">
            <h3 className="text-xl font-bold text-[#1B2A41] mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center text-white hover:opacity-80 transition"
              >
                f
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center text-white hover:opacity-80 transition"
              >
                𝕏
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center text-white hover:opacity-80 transition"
              >
                in
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] rounded-lg flex items-center justify-center text-white hover:opacity-80 transition"
              >
                📷
              </a>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40"
        >
          <h2 className="text-2xl font-bold text-[#1B2A41] mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A41] mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A41] mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A41] mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition
                "
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[#1B2A41] mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows="5"
                className="
                  w-full px-4 py-3 rounded-lg
                  bg-[#F7FBFF] border border-[#8FD6F6]/40
                  text-[#1B2A41] placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#6A8EF0]
                  transition resize-none
                "
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              type="submit"
              className="
                w-full py-3 rounded-lg text-white font-semibold
                bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
                hover:opacity-90 transition
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-[#8FD6F6]/40"
      >
        <h2 className="text-3xl font-bold text-[#1B2A41] mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-[#1B2A41] mb-2">How long does delivery take?</h4>
            <p className="text-gray-600">
              Most orders are delivered within 3-5 business days depending on your location.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1B2A41] mb-2">What is your return policy?</h4>
            <p className="text-gray-600">
              We offer 7-day returns on most products. Check our return policy for details.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1B2A41] mb-2">Do you offer customer support?</h4>
            <p className="text-gray-600">
              Yes! Our support team is available 24/7 via email and phone.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1B2A41] mb-2">How can I become a seller?</h4>
            <p className="text-gray-600">
              Visit our Seller Apply page to register and start selling on ZyCart.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact;
