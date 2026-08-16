import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";

// ===========================================================
// HELPER: Extract token from Authorization header
// ===========================================================
const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

// ===========================================================
// PROTECT USER ROUTES
// Verifies JWT and looks up the User model
// ===========================================================
export const protectUser = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(401).json({
        success: false,
        message: "User does not exist.",
      });

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account is banned. Contact support.",
      });
    }

    req.user = {
      _id: user._id,
      userId: user._id,
      userDoc: user,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ===========================================================
// PROTECT SELLER ROUTES
// Verifies JWT and looks up the Seller model
// ===========================================================
export const protectSeller = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id);

    if (!seller)
      return res.status(401).json({
        success: false,
        message: "Seller does not exist.",
      });

    if (seller.isBanned)
      return res.status(403).json({
        success: false,
        message: "Your seller account is banned.",
      });

    if (!seller.isApproved)
      return res.status(403).json({
        success: false,
        message: "Your seller account is pending approval.",
      });

    req.user = {
      _id: seller._id,
      userId: seller._id,
      userDoc: seller,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ===========================================================
// PROTECT ADMIN ROUTES
// Verifies JWT and looks up the Admin model
// ===========================================================
export const protectAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin)
      return res.status(401).json({
        success: false,
        message: "Admin does not exist.",
      });

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    req.user = {
      _id: admin._id,
      userId: admin._id,
      role: admin.role || "admin",
      permissions: admin.permissions || [],
      userDoc: admin,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

// ===========================================================
// PERMISSION CHECK MIDDLEWARE
// ===========================================================
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Super Admin bypasses all individual permission checks
    if (req.user.role === "super_admin") {
      return next();
    }

    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires '${permission}' permission.`,
    });
  };
};

// ===========================================================
// SUPER ADMIN ONLY MIDDLEWARE
// ===========================================================
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role === "super_admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Super Admin privileges required.",
  });
};
