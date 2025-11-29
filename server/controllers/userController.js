import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

// ----------------------------------------------------------
// GET LOGGED IN USER PROFILE
// ----------------------------------------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE USER PROFILE
// ----------------------------------------------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, mobile },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// DELETE ACCOUNT
// ----------------------------------------------------------
// USER: permanently deleted
// SUPPLIER: deactivate account + mark products unavailable
// ADMIN: can't delete self (optional rule)
// ----------------------------------------------------------
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    // If supplier → deactivate only
    if (user.role === "supplier") {
      const supplier = await Supplier.findById(user.supplierId);

      if (supplier) {
        supplier.isBanned = true; // deactivate supplier
        await supplier.save();

        // Mark all products unavailable
        await Product.updateMany(
          { supplier: supplier._id },
          { isAvailable: false }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Supplier account deactivated. Products marked unavailable.",
      });
    }

    // If user → permanent delete
    if (user.role === "user") {
      await User.findByIdAndDelete(user._id);

      return res.status(200).json({
        success: true,
        message: "User account deleted permanently.",
      });
    }

    // Optional: prevent admins from deleting themselves
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted.",
      });
    }
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// SET ADDRESS WHEN USER PLACES FIRST ORDER
// ----------------------------------------------------------
export const updateAddressOnOrder = async (userId, address) => {
  try {
    await User.findByIdAndUpdate(userId, { address });
  } catch (error) {
    console.error("Address update error:", error);
  }
};
