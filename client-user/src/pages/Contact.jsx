import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSettings } from "../context/SettingsProvider";

const Contact = () => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `Contact Us | ${settings?.platformName || "ZyCart"}`;
  }, [settings?.platformName]);

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
        <h1 className="text-5xl font-extrabold text-slate-900">Contact Us</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
          <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200/80">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              Get In Touch
            </h2>

            {/* Email */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-white text-xl">✉️</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">Email</h4>
                  <p className="text-slate-600 font-medium">{settings?.supportEmail || "support@zycart.com"}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-white text-xl">📞</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">Phone</h4>
                  <p className="text-slate-600 font-medium">{settings?.supportPhone || "+91 98765 43210"}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">Address</h4>
                  <div className="text-slate-600 font-medium whitespace-pre-line text-sm leading-relaxed">
                    {settings?.address || "123 Tech Street, Innovation Hub\nNew Delhi, Delhi 110001\nIndia"}
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-white text-xl">🕐</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900">Business Hours</h4>
                  <div className="text-slate-600 font-medium whitespace-pre-line text-sm leading-relaxed">
                    {settings?.businessHours || "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-gradient-to-r from-blue-50/70 to-orange-50/70 rounded-3xl p-8 border border-slate-200/80">
            <h3 className="text-xl font-black text-slate-900 mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center text-white hover:opacity-80 transition shadow-sm cursor-pointer"
              >
                f
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center text-white hover:opacity-80 transition shadow-sm cursor-pointer"
              >
                𝕏
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center text-white hover:opacity-80 transition shadow-sm cursor-pointer"
              >
                in
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center text-white hover:opacity-80 transition shadow-sm cursor-pointer"
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
          className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200/80"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="
                  w-full px-4 py-3.5 rounded-2xl
                  bg-slate-50 border border-slate-200
                  text-slate-900 placeholder-slate-400 font-semibold
                  focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500
                  transition text-sm
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="
                  w-full px-4 py-3.5 rounded-2xl
                  bg-slate-50 border border-slate-200
                  text-slate-900 placeholder-slate-400 font-semibold
                  focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500
                  transition text-sm
                "
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="
                  w-full px-4 py-3.5 rounded-2xl
                  bg-slate-50 border border-slate-200
                  text-slate-900 placeholder-slate-400 font-semibold
                  focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500
                  transition text-sm
                "
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows="5"
                className="
                  w-full px-4 py-3.5 rounded-2xl
                  bg-slate-50 border border-slate-200
                  text-slate-900 placeholder-slate-400 font-semibold
                  focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500
                  transition resize-none text-sm
                "
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="
                w-full py-4 rounded-2xl text-white font-extrabold text-base
                bg-gradient-to-r from-[#F97316] to-[#EA580C]
                hover:from-[#EA580C] hover:to-[#C2410C]
                shadow-lg shadow-orange-500/25 transition cursor-pointer
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
        className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 border border-slate-200/80 space-y-8"
      >
        <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">How long does delivery take?</h4>
            <p className="text-slate-600 text-sm font-medium">
              Most orders are delivered within 3-5 business days depending on your location.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">What is your return policy?</h4>
            <p className="text-slate-600 text-sm font-medium">
              We offer 7-day returns on most products. Check our return policy for details.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">Do you offer customer support?</h4>
            <p className="text-slate-600 text-sm font-medium">
              Yes! Our support team is available 24/7 via email and phone.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900">How can I become a seller?</h4>
            <p className="text-slate-600 text-sm font-medium">
              Visit our Seller Apply page to register and start selling on ZyCart.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Contact;
