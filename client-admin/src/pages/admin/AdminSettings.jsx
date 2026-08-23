import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";
import {
  Sliders,
  Settings,
  Globe,
  Truck,
  Store,
  ShieldCheck,
  Save,
  RotateCcw,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Lock,
  Percent,
  Mail,
  Phone,
  ShieldAlert,
  Clock,
  Boxes,
  DollarSign
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const DEFAULT_SETTINGS = {
  platformName: "ZyCart",
  tagline: "Easy Shop, Easy Life",
  supportEmail: "support@zycart.com",
  supportPhone: "+91 98765 43210",
  currencySymbol: "₹",
  address: "123 Tech Street, Innovation Hub\nNew Delhi, Delhi 110001\nIndia",
  businessHours: "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed",
  announcementBanner: {
    enabled: false,
    message: "Welcome to ZyCart! Enjoy free shipping on orders above ₹499.",
  },
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  minOrderValue: 0,
  defaultMaxQuantityPerItem: 5,
  estimatedDeliveryDays: "3-5 Business Days",
  platformCommissionRate: 5,
  autoApproveSellers: false,
  maxProductsPerSeller: 50,
  requireGstin: true,
  enableCustomer2FA: true,
  enableSeller2FA: true,
  enableAdmin2FA: true,
  maintenanceMode: {
    enabled: false,
    message: "ZyCart is currently undergoing scheduled platform maintenance. We'll be back shortly!",
  },
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/settings");
      if (res.data.success && res.data.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data.settings,
          announcementBanner: {
            ...DEFAULT_SETTINGS.announcementBanner,
            ...(res.data.settings.announcementBanner || {}),
          },
          maintenanceMode: {
            ...DEFAULT_SETTINGS.maintenanceMode,
            ...(res.data.settings.maintenanceMode || {}),
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "System Settings | ZyCart Admin";
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put("/admin/settings", settings);
      if (res.data.success) {
        toast.success("System settings updated successfully!");
        setSettings((prev) => ({
          ...prev,
          ...res.data.settings,
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all configurations to default system values?")) {
      setSettings(DEFAULT_SETTINGS);
      toast.success("Settings restored to defaults. Click 'Save Changes' to persist.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1B2A41] via-[#243B5A] to-[#3F51F4] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Settings className="w-3.5 h-3.5 text-blue-300" /> Platform Infrastructure
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Global System Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-xl font-medium">
              Configure global marketplace logistics, seller commission policies, 2FA authentication, announcements, and platform operations.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Defaults
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-3 rounded-2xl bg-white text-[#1B2A41] font-black text-xs shadow-lg hover:bg-slate-50 transition transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#3F51F4]" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Maintenance Alert Notification (if active) */}
        {settings.maintenanceMode?.enabled && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold uppercase tracking-wide text-amber-800">
                Warning: Maintenance Mode is currently ACTIVE
              </span>
              <p className="mt-0.5 text-amber-700 font-medium">{settings.maintenanceMode.message}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "general"
                ? "bg-[#3F51F4] text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Globe className="w-4 h-4" /> General &amp; Brand
          </button>

          <button
            onClick={() => setActiveTab("logistics")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "logistics"
                ? "bg-[#3F51F4] text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Truck className="w-4 h-4" /> Logistics &amp; Shipping
          </button>

          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "sellers"
                ? "bg-[#3F51F4] text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <Store className="w-4 h-4" /> Merchant &amp; Commissions
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "security"
                ? "bg-[#3F51F4] text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Security &amp; Maintenance
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: GENERAL & BRANDING */}
        {/* ========================================================= */}
        {activeTab === "general" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-[#1B2A41] flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#3F51F4]" /> Platform Identity &amp; Contact Info
                </h3>
                <p className="text-xs text-slate-500 font-medium">Brand names, currency symbols, and customer communication channels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Platform Marketplace Name
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Support Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Headquarters / Physical Address
                  </label>
                  <textarea
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Enter platform address (displayed on Contact Us & Footer)..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Customer Support &amp; Business Operating Hours
                  </label>
                  <textarea
                    rows={3}
                    value={settings.businessHours}
                    onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                    placeholder="Enter operating hours (e.g. Monday - Friday: 9:00 AM - 6:00 PM)..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Banner Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-[#1B2A41] flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#3F51F4]" /> Storefront Announcement Banner
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Broadcast sales, promo codes, or notices across the customer storefront.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.announcementBanner?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementBanner: {
                          ...settings.announcementBanner,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Banner Text Message
                </label>
                <textarea
                  rows={2}
                  disabled={!settings.announcementBanner?.enabled}
                  value={settings.announcementBanner?.message || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: {
                        ...settings.announcementBanner,
                        message: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Free delivery on all orders above ₹499 this weekend!"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LOGISTICS & SHIPPING */}
        {/* ========================================================= */}
        {activeTab === "logistics" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-[#1B2A41] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#3F51F4]" /> Delivery, Fees &amp; Order Policies
                </h3>
                <p className="text-xs text-slate-500 font-medium">Configure shipping fees, free shipping thresholds, and order quantity limits.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Standard Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Default flat shipping fee added to orders below threshold.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Free Delivery Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Orders with total above this amount receive 100% free delivery.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Minimum Cart Checkout Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minOrderValue}
                    onChange={(e) => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Set to 0 for no minimum purchase restriction.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Default Max Purchase Qty Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={settings.defaultMaxQuantityPerItem}
                    onChange={(e) => setSettings({ ...settings, defaultMaxQuantityPerItem: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Maximum units a customer can buy per item in a single order.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Delivery Duration
                  </label>
                  <input
                    type="text"
                    value={settings.estimatedDeliveryDays}
                    onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: e.target.value })}
                    placeholder="e.g. 3-5 Business Days"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MERCHANTS & COMMISSION */}
        {/* ========================================================= */}
        {activeTab === "sellers" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-[#1B2A41] flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#3F51F4]" /> Merchant Policies &amp; Platform Revenue
                </h3>
                <p className="text-xs text-slate-500 font-medium">Manage seller commission percentage, auto-approval workflows, and product quota limits.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-slate-400" /> Platform Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.platformCommissionRate}
                    onChange={(e) => setSettings({ ...settings, platformCommissionRate: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Percentage deducted from completed merchant orders as marketplace commission.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" /> Max Product Listings per Seller
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.maxProductsPerSeller}
                    onChange={(e) => setSettings({ ...settings, maxProductsPerSeller: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-[#3F51F4] outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Upper limit of active catalog items allowed per merchant store.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Auto-Approve Seller Applications</h4>
                    <p className="text-[11px] text-slate-500 font-medium">When enabled, newly registered sellers are approved automatically without manual review.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoApproveSellers}
                      onChange={(e) => setSettings({ ...settings, autoApproveSellers: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Mandatory GSTIN Tax Verification</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Require merchants to provide a valid 15-character GSTIN identifier during onboarding.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireGstin}
                      onChange={(e) => setSettings({ ...settings, requireGstin: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SECURITY & MAINTENANCE */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 2FA Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-[#1B2A41] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#3F51F4]" /> Two-Factor Authentication (2FA) Security
                </h3>
                <p className="text-xs text-slate-500 font-medium">Control multi-factor OTP verification for customer, merchant, and admin sign-in flows.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Customer 2FA Sign-In Protection</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Send email OTP verification for customer sign-ins.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableCustomer2FA}
                      onChange={(e) => setSettings({ ...settings, enableCustomer2FA: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Merchant 2FA Sign-In Protection</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Send email OTP verification for merchant dashboard access.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSeller2FA}
                      onChange={(e) => setSettings({ ...settings, enableSeller2FA: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">Admin Operations 2FA Sign-In</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Send email OTP verification for administrators.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableAdmin2FA}
                      onChange={(e) => setSettings({ ...settings, enableAdmin2FA: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F51F4]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Maintenance Mode Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-red-600 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" /> Platform Maintenance Mode
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Emergency kill-switch to temporarily suspend customer checkouts during upgrades.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode?.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMode: {
                          ...settings.maintenanceMode,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Downtime Message Displayed to Visitors
                </label>
                <textarea
                  rows={3}
                  disabled={!settings.maintenanceMode?.enabled}
                  value={settings.maintenanceMode?.message || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: {
                        ...settings.maintenanceMode,
                        message: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none transition disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminSettings;
