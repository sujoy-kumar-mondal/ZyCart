import User from "../models/User.js";
import Order from "../models/Order.js";

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
// GET USER STATS (REALTIME ORDERS & SPENDING)
// ===========================================================
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const [user, userOrders] = await Promise.all([
      User.findById(userId),
      Order.find({ user: userId }),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const totalOrders = userOrders.length;
    const totalSpent = userOrders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const cartItems = user.cart
      ? user.cart.reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
      : 0;

    const stats = {
      totalOrders,
      totalSpent,
      cartItems,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("getUserStats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
