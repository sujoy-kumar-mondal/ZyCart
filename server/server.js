import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { initializeCategoryCache } from "./utils/categories.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import attributeRoutes from "./routes/attributeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import SystemSetting from "./models/SystemSetting.js";


const app = express();

// -----------------------------------
// Database Connection
// -----------------------------------
connectDB();

// Initialize category cache after DB connection
const initCache = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for DB connection
    await initializeCategoryCache();
  } catch (error) {
    console.error("Failed to initialize category cache:", error.message);
  }
};

initCache();

// -----------------------------------
// Middlewares
// -----------------------------------
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL1, // client-user
      process.env.CLIENT_URL2, // client-seller
      process.env.CLIENT_URL3, // client-admin
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Maintenance Mode Interceptor
app.use(async (req, res, next) => {
  if (
    req.path.startsWith("/admin") ||
    req.path.startsWith("/settings") ||
    req.path.startsWith("/auth/admin") ||
    req.path === "/" ||
    req.path === "/health"
  ) {
    return next();
  }

  try {
    const settings = await SystemSetting.findOne();
    if (settings?.maintenanceMode?.enabled) {
      if (req.method !== "GET" || req.path.startsWith("/orders") || req.path.startsWith("/cart")) {
        return res.status(503).json({
          success: false,
          maintenance: true,
          message: settings.maintenanceMode.message || "System is under scheduled maintenance. Please try again later.",
        });
      }
    }
  } catch (err) {}
  next();
});

// -----------------------------------
// HEALTH CHECK ROUTES (For deployment)
// -----------------------------------
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "ZyCart API is running" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// -----------------------------------
// API ROUTES
// -----------------------------------
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/seller", sellerRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/categories", categoryRoutes);
app.use("/attributes", attributeRoutes);
app.use("/reviews", reviewRoutes);
app.use("/settings", settingsRoutes);

// -----------------------------------
// Error Handler (Global)
// -----------------------------------
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -----------------------------------
// Server Listen
// -----------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
