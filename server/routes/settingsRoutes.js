import express from "express";
import SystemSetting from "../models/SystemSetting.js";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const router = express.Router();

// GET /settings or /settings/public - Public access for storefront and merchant app
router.get(["/", "/public"], async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }

    // Realtime Database Statistics
    const [
      productsCount,
      sellersCount,
      ordersShippedCount,
      deliveredOrdersCount,
      totalOrdersCount,
      usersCount,
      reviewsData,
    ] = await Promise.all([
      Product.countDocuments({ isAvailable: true }),
      Seller.countDocuments({ isApproved: true, isBanned: { $ne: true } }),
      Order.countDocuments({ status: { $in: ["Shipped", "Out for Delivery", "Delivered"] } }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments(),
      User.countDocuments(),
      Review.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const reviewCount = reviewsData[0]?.count || 0;
    const avgScore = reviewsData[0]?.avgRating
      ? (Math.round(reviewsData[0].avgRating * 10) / 10).toFixed(1)
      : "5.0";

    const deliveryRate = totalOrdersCount > 0
      ? `${(Math.round((deliveredOrdersCount / totalOrdersCount) * 1000) / 10).toFixed(1)}%`
      : "99.4%";

    res.status(200).json({
      success: true,
      settings: {
        platformName: settings.platformName || "ZyCart",
        tagline: settings.tagline || "Easy Shop, Easy Life",
        supportEmail: settings.supportEmail || "support@zycart.com",
        supportPhone: settings.supportPhone || "+91 98765 43210",
        currencySymbol: settings.currencySymbol || "₹",
        address: settings.address || "123 Tech Street, Innovation Hub\nNew Delhi, Delhi 110001\nIndia",
        businessHours: settings.businessHours || "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed",
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
      stats: {
        activeProducts: productsCount,
        verifiedSellers: sellersCount,
        ordersShipped: ordersShippedCount,
        ordersFulfilled: deliveredOrdersCount,
        totalOrders: totalOrdersCount,
        happyShoppers: usersCount,
        reviewCount,
        buyerSatisfactionScore: `${avgScore} / 5.0`,
        deliverySuccessRate: deliveryRate,
        systemUptime: "99.99%",
      },
    });
  } catch (error) {
    console.error("Get public settings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching settings" });
  }
});

export default router;
