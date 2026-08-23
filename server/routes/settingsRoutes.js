import express from "express";
import SystemSetting from "../models/SystemSetting.js";

const router = express.Router();

// GET /settings or /settings/public - Public access for storefront and merchant app
router.get(["/", "/public"], async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }

    res.status(200).json({
      success: true,
      settings: {
        platformName: settings.platformName || "ZyCart",
        tagline: settings.tagline || "Easy Shop, Easy Life",
        supportEmail: settings.supportEmail || "support@zycart.com",
        supportPhone: settings.supportPhone || "+91 98765 43210",
        currencySymbol: settings.currencySymbol || "₹",
        announcementBanner: settings.announcementBanner || {
          enabled: false,
          message: "Welcome to ZyCart! Enjoy free shipping on orders above ₹499.",
        },
        deliveryFee: settings.deliveryFee ?? 40,
        freeDeliveryThreshold: settings.freeDeliveryThreshold ?? 499,
        minOrderValue: settings.minOrderValue ?? 0,
        defaultMaxQuantityPerItem: settings.defaultMaxQuantityPerItem ?? 5,
        estimatedDeliveryDays: settings.estimatedDeliveryDays || "3-5 Business Days",
        platformCommissionRate: settings.platformCommissionRate ?? 5,
        autoApproveSellers: settings.autoApproveSellers || false,
        maxProductsPerSeller: settings.maxProductsPerSeller ?? 50,
        requireGstin: settings.requireGstin !== false,
        enableCustomer2FA: settings.enableCustomer2FA !== false,
        enableSeller2FA: settings.enableSeller2FA !== false,
        enableAdmin2FA: settings.enableAdmin2FA !== false,
        maintenanceMode: settings.maintenanceMode || {
          enabled: false,
          message: "ZyCart is currently undergoing scheduled platform maintenance. We'll be back shortly!",
        },
      },
    });
  } catch (error) {
    console.error("Get public settings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching settings" });
  }
});

export default router;
