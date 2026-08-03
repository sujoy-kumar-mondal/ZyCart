import User from "../models/User.js";

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
// DELETE ACCOUNT (User only)
// ===========================================================
export const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.user;

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted permanently.",
    });
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
