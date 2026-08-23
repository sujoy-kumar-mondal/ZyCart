import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axiosInstance.js";

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

const DEFAULT_STATS = {
  activeProducts: 0,
  verifiedSellers: 0,
  ordersShipped: 0,
  ordersFulfilled: 0,
  totalOrders: 0,
  happyShoppers: 0,
  reviewCount: 0,
  buyerSatisfactionScore: "No reviews yet",
  deliverySuccessRate: "100%",
  systemUptime: "99.99%",
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
  loading: true,
  refreshSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/settings/public");
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
      if (res.data.success && res.data.stats) {
        setStats({
          ...DEFAULT_STATS,
          ...res.data.stats,
        });
      }
    } catch (error) {
      console.error("Failed to load platform settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, stats, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
