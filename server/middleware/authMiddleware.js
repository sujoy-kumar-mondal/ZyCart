import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";

// ===========================================================
// AUTHENTICATE USER USING JWT (for any role)
// ===========================================================
export const protect = async (req, res, next) => {
  try {
    let token;

    // Token via Authorization header: "Bearer token"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Route user to correct model based on role
    let user;
    if (decoded.role === "seller") {
      user = await Seller.findById(decoded.id);
    } else if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user)
      return res.status(401).json({
        success: false,
        message: "User does not exist.",
      });

    // Check appropriate status based on role
    if (decoded.role === "user" && user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account is banned. Contact support.",
      });
    }

    if (decoded.role === "seller" && user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your seller account is banned.",
      });
    }

    if (decoded.role === "admin" && !user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    req.user = {
      _id: user._id,
      userId: user._id,
      role: decoded.role,
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
// ROLE-BASED PROTECTION
// ===========================================================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission.",
      });

    next();
  };
};

// ===========================================================
// ROLE-SPECIFIC PROTECTORS (for direct role access)
// ===========================================================
export const protectUser = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "User access only.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || user.isBanned)
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });

    req.user = {
      _id: user._id,
      userId: user._id,
      role: "user",
      userDoc: user,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized.",
    });
  }
};

export const protectSeller = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller access only.",
      });
    }

    const seller = await Seller.findById(decoded.id);

    if (!seller || seller.isBanned || !seller.isApproved)
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });

    req.user = {
      _id: seller._id,
      userId: seller._id,
      role: "seller",
      userDoc: seller,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized.",
    });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only.",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive)
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });

    req.user = {
      _id: admin._id,
      userId: admin._id,
      role: "admin",
      userDoc: admin,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized.",
    });
  }
};
