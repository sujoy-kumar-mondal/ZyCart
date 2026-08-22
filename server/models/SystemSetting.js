import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    // General Information
    platformName: {
      type: String,
      default: "ZyCart",
      trim: true,
    },
    tagline: {
      type: String,
      default: "Easy Shop, Easy Life",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "support@zycart.com",
      trim: true,
    },
    supportPhone: {
      type: String,
      default: "+91 98765 43210",
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: "₹",
    },
    announcementBanner: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "Welcome to ZyCart! Enjoy free shipping on orders above ₹499.",
        trim: true,
      },
    },

    // Logistics, Orders & Pricing
    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    defaultMaxQuantityPerItem: {
      type: Number,
      default: 5,
      min: 1,
      max: 25,
    },
    estimatedDeliveryDays: {
      type: String,
      default: "3-5 Business Days",
      trim: true,
    },

    // Seller Policies & Commissions
    platformCommissionRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    autoApproveSellers: {
      type: Boolean,
      default: false,
    },
    maxProductsPerSeller: {
      type: Number,
      default: 50,
      min: 1,
    },
    requireGstin: {
      type: Boolean,
      default: true,
    },

    // Security & Operations
    enableCustomer2FA: {
      type: Boolean,
      default: true,
    },
    enableSeller2FA: {
      type: Boolean,
      default: true,
    },
    enableAdmin2FA: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "ZyCart is currently undergoing scheduled platform maintenance. We'll be back shortly!",
        trim: true,
      },
    },
  },
  { timestamps: true }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
