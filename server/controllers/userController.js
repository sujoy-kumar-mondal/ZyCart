import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";

// ===========================================================
// GET LOGGED IN USER PROFILE
// ===========================================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -otp");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// UPDATE USER PROFILE
// ===========================================================
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { name, mobile, ...(address && { address }) },
      { new: true }
    ).select("-password -otp");

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// DELETE ACCOUNT
// ===========================================================
// USER: permanently delete account
// SELLER: deactivate seller account + mark products unavailable
// ADMIN: deactivate admin account
// ===========================================================
export const deleteAccount = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role === "user") {
      // Delete user account
      await User.findByIdAndDelete(userId);

      return res.status(200).json({
        success: true,
        message: "User account deleted permanently.",
      });
    }

    if (role === "seller") {
      // Deactivate seller account
      const seller = await Seller.findByIdAndUpdate(
        userId,
        { isActive: false, isBanned: true },
        { new: true }
      );

      // Mark all seller products unavailable
      if (seller) {
        await Product.updateMany(
          { seller: seller._id },
          { isAvailable: false }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Seller account deactivated. Products marked unavailable.",
        seller,
      });
    }

    if (role === "admin") {
      // Deactivate admin account (prevent self-deletion)
      const admin = await Admin.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Admin account deactivated.",
        admin,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===========================================================
// SET ADDRESS WHEN USER PLACES FIRST ORDER
// ===========================================================
export const updateAddressOnOrder = async (userId, address) => {
  try {
    await User.findByIdAndUpdate(userId, { address });
  } catch (error) {
  }
};

// ===========================================================
// GET USER STATS
// ===========================================================
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const stats = {
      totalOrders: 0, // Would need to query Orders collection
      totalSpent: 0,
      cartItems: user.cart.length,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
