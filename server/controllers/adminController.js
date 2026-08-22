import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import CategoryAttribute from "../models/CategoryAttribute.js";
import AttributeSchema from "../models/AttributeSchema.js";
import SystemSetting from "../models/SystemSetting.js";

// ------------------------------------------------------------
// ADMIN DASHBOARD
// ------------------------------------------------------------
export const getAdminDashboard = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const sellers = await Seller.countDocuments();
    const orders = await Order.countDocuments();
    const pendingDeliveries = await Order.countDocuments({
      status: { $ne: "Delivered" }
    });

    res.status(200).json({
      success: true,
      users,
      sellers,
      orders,
      pendingDeliveries
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ----------------------------------------------------------
// GET ALL USERS
// ----------------------------------------------------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp");

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// BAN USER
// ----------------------------------------------------------
export const banUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: true });

    res.status(200).json({
      success: true,
      message: "User banned successfully",
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UNBAN USER
// ----------------------------------------------------------
export const unbanUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBanned: false });

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ALL SELLERS
// ----------------------------------------------------------
export const getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select("-password -otp");

    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    console.error("Get sellers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// APPROVE SELLER
// ----------------------------------------------------------
export const approveSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isApproved = true;
    seller.isBanned = false;
    seller.approvalDate = new Date();

    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      seller,
    });
  } catch (error) {
    console.error("Approve seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// BAN SELLER + Mark products unavailable
// ----------------------------------------------------------
export const banSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isBanned = true;
    seller.isApproved = false;

    await seller.save();

    // Mark all products unavailable
    await Product.updateMany(
      { seller: sellerId },
      { isAvailable: false }
    );

    res.status(200).json({
      success: true,
      message: "Seller banned & products marked unavailable",
    });
  } catch (error) {
    console.error("Ban seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UNBAN SELLER (needs re-approval)
// ----------------------------------------------------------
export const unbanSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller)
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });

    seller.isBanned = false;
    // Still admin must APPROVE manually
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller unbanned. Must be approved again.",
    });
  } catch (error) {
    console.error("Unban seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ALL PARENT ORDERS (Admin Dashboard)
// ----------------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("childOrders.seller", "shopName")
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE PARENT ORDER STATUS
// Only Admin controls:
// Shipped → Out for Delivery → Delivered
// ----------------------------------------------------------
export const updateParentOrderStatus = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(parentId);

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });

    order.status = status;
    const now = new Date();
    if (status === "Confirmed" && !order.confirmedAt) order.confirmedAt = now;
    if (status === "Packed" && !order.packedAt) order.packedAt = now;
    if (status === "Shipped" && !order.shippedAt) order.shippedAt = now;
    if (status === "Out for Delivery" && !order.outForDeliveryAt) order.outForDeliveryAt = now;
    if (status === "Delivered") {
      if (!order.deliveredAt) order.deliveredAt = now;
      order.paymentStatus = "completed";
    }
    if (status === "Cancelled" && !order.cancelledAt) order.cancelledAt = now;

    // Also update all child orders if parent status changed
    order.childOrders.forEach((child) => {
      child.status = status;
      if (status === "Confirmed" && !child.confirmedAt) child.confirmedAt = now;
      if (status === "Packed" && !child.packedAt) child.packedAt = now;
      if (status === "Shipped" && !child.shippedAt) child.shippedAt = now;
      if (status === "Out for Delivery" && !child.outForDeliveryAt) child.outForDeliveryAt = now;
      if (status === "Delivered" && !child.deliveredAt) child.deliveredAt = now;
      if (status === "Cancelled" && !child.cancelledAt) child.cancelledAt = now;
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN PROFILE
// ----------------------------------------------------------
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE ADMIN PROFILE
// ----------------------------------------------------------
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, mobile, address } = req.body;

    const updated = await Admin.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        mobile,
        ...(address && { address }),
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      admin: updated,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN ORDER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email mobile")
      .populate("childOrders.seller", "shopName email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN USER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user orders
    const orders = await Order.find({ user: userId })
      .select("parentOrderNumber status totalAmount createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        addresses: user.addresses,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        orders,
      },
    });
  } catch (error) {
    console.error("Get admin user details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ADMIN SELLER DETAILS BY ID
// ----------------------------------------------------------
export const getAdminSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId).select("-password -otp");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Get seller products
    const products = await Product.find({ seller: sellerId }).select("title price stock discount discountedPrice discountPeriod images description mainCategory subCategory subSubCategory attributes maxQuantityPerPurchase");

    const sellerObj = seller.toObject();

    res.status(200).json({
      success: true,
      seller: {
        ...sellerObj,
        products,
        totalProducts: products.length,
      },
    });
  } catch (error) {
    console.error("Get admin seller details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// DELETE USER
// ----------------------------------------------------------
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================================
// SUPER ADMIN MANAGEMENT CONTROLLERS
// ============================================================

// 1. GET ALL ADMINS (Super Admin only)
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const isStrongPassword = (pwd) => {
  if (!pwd || pwd.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

// 2. CREATE NEW ADMIN ACCOUNT (Super Admin only)
export const createAdminAccount = async (req, res) => {
  try {
    const { name, email, password, mobile, role, permissions } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and mobile number are required.",
      });
    }

    if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be a valid 10-digit number.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
      });
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An admin account with this email already exists.",
      });
    }

    const adminRole = role === "super_admin" ? "super_admin" : "admin";

    const newAdmin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      mobile: String(mobile).trim(),
      role: adminRole,
      permissions: permissions || ["manage_users", "manage_sellers"],
      isActive: true,
    });

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. UPDATE ADMIN ACCOUNT (Super Admin only)
export const updateAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, permissions, isActive, password } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (mobile !== undefined) {
      if (!mobile || !/^[0-9]{10}$/.test(String(mobile).trim())) {
        return res.status(400).json({
          success: false,
          message: "Mobile number must be a valid 10-digit number.",
        });
      }
      admin.mobile = String(mobile).trim();
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (symbol).",
        });
      }
      admin.password = password; // pre('save') will hash it automatically
    }

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (role && ["super_admin", "admin"].includes(role)) admin.role = role;
    if (Array.isArray(permissions)) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. DELETE ADMIN ACCOUNT (Super Admin only)
export const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Admin account deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================================
// CATEGORIES MANAGEMENT (Admin)
// ==========================================================

// 1. GET ALL CATEGORIES WITH STATS & PRODUCT COUNTS
export const getAdminCategories = async (req, res) => {
  try {
    const { search, mainCategory, status } = req.query;

    const query = {};
    if (mainCategory && mainCategory !== "all") {
      query.mainCategory = mainCategory;
    }
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { mainCategory: searchRegex },
        { subCategory: searchRegex },
        { subSubCategory: searchRegex },
      ];
    }

    const categories = await Category.find(query).sort({ mainCategory: 1, subCategory: 1, subSubCategory: 1 });

    const allMainCategories = await Category.distinct("mainCategory");
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const inactiveCategories = await Category.countDocuments({ isActive: false });

    // Product counts per category hierarchy
    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: {
            main: "$mainCategory",
            sub: "$subCategory",
            subsub: "$subSubCategory",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      if (item._id && item._id.main && item._id.sub && item._id.subsub) {
        const key = `${item._id.main}|${item._id.sub}|${item._id.subsub}`;
        countMap[key] = item.count;
      }
    });

    // Attribute counts per category hierarchy
    const allCategoryAttributes = await CategoryAttribute.find().select("mainCategory subCategory subSubCategory fields");
    const attrCountMap = {};
    allCategoryAttributes.forEach((attr) => {
      const key = `${attr.mainCategory}|${attr.subCategory}|${attr.subSubCategory}`;
      attrCountMap[key] = (attr.fields && attr.fields.length) || 0;
    });

    const enrichedCategories = categories.map((cat) => {
      const key = `${cat.mainCategory}|${cat.subCategory}|${cat.subSubCategory}`;
      return {
        ...cat.toObject(),
        productCount: countMap[key] || 0,
        attributeCount: attrCountMap[key] || 0,
      };
    });

    res.status(200).json({
      success: true,
      categories: enrichedCategories,
      stats: {
        total: totalCategories,
        active: activeCategories,
        inactive: inactiveCategories,
        mainCategoriesCount: allMainCategories.length,
      },
      mainCategories: allMainCategories,
    });
  } catch (error) {
    console.error("Get admin categories error:", error);
    res.status(500).json({ success: false, message: "Server error fetching categories" });
  }
};

// 2. CREATE CATEGORY
export const createAdminCategory = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory, isActive } = req.body;

    if (!mainCategory || !subCategory || !subSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Main Category, Sub-Category, and Sub-Sub-Category are all required.",
      });
    }

    const trimmedMain = mainCategory.trim();
    const trimmedSub = subCategory.trim();
    const trimmedSubSub = subSubCategory.trim();

    const existing = await Category.findOne({
      mainCategory: { $regex: new RegExp(`^${trimmedMain}$`, "i") },
      subCategory: { $regex: new RegExp(`^${trimmedSub}$`, "i") },
      subSubCategory: { $regex: new RegExp(`^${trimmedSubSub}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This category hierarchy already exists in the system.",
      });
    }

    const newCategory = await Category.create({
      mainCategory: trimmedMain,
      subCategory: trimmedSub,
      subSubCategory: trimmedSubSub,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Create admin category error:", error);
    res.status(500).json({ success: false, message: "Server error creating category" });
  }
};

// 3. UPDATE CATEGORY
export const updateAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainCategory, subCategory, subSubCategory, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (mainCategory) category.mainCategory = mainCategory.trim();
    if (subCategory) category.subCategory = subCategory.trim();
    if (subSubCategory) category.subSubCategory = subSubCategory.trim();
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update admin category error:", error);
    res.status(500).json({ success: false, message: "Server error updating category" });
  }
};

// 4. DELETE CATEGORY
export const deleteAdminCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productsInCat = await Product.countDocuments({
      mainCategory: category.mainCategory,
      subCategory: category.subCategory,
      subSubCategory: category.subSubCategory,
    });

    if (productsInCat > 0 && req.query.force !== "true") {
      return res.status(400).json({
        success: false,
        hasProducts: true,
        productCount: productsInCat,
        message: `Cannot delete: ${productsInCat} product(s) are currently categorized under this hierarchy. Please re-assign or delete those products first.`,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin category error:", error);
    res.status(500).json({ success: false, message: "Server error deleting category" });
  }
};

// 5. GET ATTRIBUTES FOR A SPECIFIC CATEGORY
export const getAdminCategoryAttributes = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { mainCategory, subCategory, subSubCategory } = category;

    let record = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
    });

    if (!record) {
      const schemaRecord = await AttributeSchema.findOne({
        mainCategory,
        subCategory,
        subSubCategory,
      });

      if (schemaRecord && schemaRecord.fields && schemaRecord.fields.length > 0) {
        record = { fields: schemaRecord.fields };
      }
    }

    const sanitizedFields = (record?.fields || []).map((f) => {
      const fieldObj = (f.toObject && f.toObject()) || f;
      let opts = [];
      if (Array.isArray(fieldObj.options)) {
        opts = fieldObj.options.map((o) => String(o));
      } else if (typeof fieldObj.options === "string" && fieldObj.options.trim()) {
        opts = fieldObj.options.split(",").map((o) => o.trim()).filter(Boolean);
      }
      return {
        ...fieldObj,
        options: opts,
      };
    });

    res.status(200).json({
      success: true,
      category,
      fields: sanitizedFields,
    });
  } catch (error) {
    console.error("Get admin category attributes error:", error);
    res.status(500).json({ success: false, message: "Server error fetching category attributes" });
  }
};

// 6. SAVE / UPDATE ATTRIBUTES FOR A CATEGORY
export const saveAdminCategoryAttributes = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: "Fields must be an array of attribute field objects.",
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { mainCategory, subCategory, subSubCategory } = category;

    // Format and sanitize fields
    const formattedFields = fields
      .map((f, idx) => {
        let optionsArray = [];
        if (Array.isArray(f.options)) {
          optionsArray = f.options.map((opt) => String(opt).trim()).filter(Boolean);
        } else if (typeof f.options === "string" && f.options.trim()) {
          optionsArray = f.options
            .split(",")
            .map((opt) => opt.trim())
            .filter(Boolean);
        }

        return {
          fieldName: String(f.fieldName || "").trim(),
          dataType: f.dataType || "Text",
          required: Boolean(f.required),
          filterable: Boolean(f.filterable),
          options: optionsArray,
          displayOrder: typeof f.displayOrder === "number" ? f.displayOrder : idx,
          placeholder: f.placeholder ? String(f.placeholder).trim() : "",
          helpText: f.helpText ? String(f.helpText).trim() : "",
        };
      })
      .filter((f) => f.fieldName.length > 0);

    // Upsert CategoryAttribute
    const updatedCategoryAttr = await CategoryAttribute.findOneAndUpdate(
      { mainCategory, subCategory, subSubCategory },
      {
        mainCategory,
        subCategory,
        subSubCategory,
        fields: formattedFields,
        isActive: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Sync AttributeSchema
    await AttributeSchema.findOneAndUpdate(
      { mainCategory, subCategory, subSubCategory },
      {
        mainCategory,
        subCategory,
        subSubCategory,
        fields: formattedFields,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Category attributes schema updated successfully",
      fields: updatedCategoryAttr.fields,
    });
  } catch (error) {
    console.error("Save admin category attributes error:", error);
    res.status(500).json({ success: false, message: "Server error saving category attributes" });
  }
};

// ==========================================================
// PRODUCTS MANAGEMENT (Admin)
// ==========================================================

// 1. GET ALL PRODUCTS ACROSS ALL SELLERS
export const getAdminProducts = async (req, res) => {
  try {
    const { search, category, availability, stockStatus, page = 1, limit = 100 } = req.query;

    const query = {};

    if (category && category !== "all") {
      query.mainCategory = category;
    }

    if (availability === "available") {
      query.isAvailable = true;
    } else if (availability === "unavailable") {
      query.isAvailable = false;
    }

    if (stockStatus === "out_of_stock") {
      query.stock = 0;
    } else if (stockStatus === "low_stock") {
      query.stock = { $gt: 0, $lte: 5 };
    } else if (stockStatus === "in_stock") {
      query.stock = { $gt: 5 };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      const matchedSellers = await Seller.find({
        $or: [{ shopName: searchRegex }, { name: searchRegex }, { email: searchRegex }],
      }).select("_id");
      const sellerIds = matchedSellers.map((s) => s._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { subCategory: searchRegex },
        { subSubCategory: searchRegex },
        { seller: { $in: sellerIds } },
      ];
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("seller", "_id shopName name email mobile isApproved isBanned")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalCatalog = await Product.countDocuments();
    const liveAvailable = await Product.countDocuments({ isAvailable: true });
    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const distinctSellers = await Product.distinct("seller");
    const allMainCategories = await Category.distinct("mainCategory");

    res.status(200).json({
      success: true,
      products,
      total: totalProducts,
      page: Number(page),
      totalPages: Math.ceil(totalProducts / Number(limit)) || 1,
      stats: {
        total: totalCatalog,
        live: liveAvailable,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        totalSellers: distinctSellers.length,
      },
      categories: allMainCategories,
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
};

// 2. GET PRODUCT DETAILS BY ID
export const getAdminProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate(
      "seller",
      "_id shopName name email mobile address isApproved isBanned createdAt"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const orderCount = await Order.countDocuments({
      "childOrders.items.productId": productId,
    });

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        orderCount,
      },
    });
  } catch (error) {
    console.error("Get admin product details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 3. TOGGLE PRODUCT AVAILABILITY / RESTRICTION
export const toggleAdminProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isAvailable = isAvailable !== undefined ? isAvailable : !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product is now ${product.isAvailable ? "Active (Live on Store)" : "Restricted (Hidden from Store)"}`,
      product,
    });
  } catch (error) {
    console.error("Toggle admin product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 4. DELETE PRODUCT BY ADMIN
export const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted from catalog successfully",
    });
  } catch (error) {
    console.error("Delete admin product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================================
// SYSTEM SETTINGS (Admin)
// ==========================================================

// 1. GET SYSTEM SETTINGS (Singleton pattern)
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get system settings error:", error);
    res.status(500).json({ success: false, message: "Server error fetching system settings" });
  }
};

// 2. UPDATE SYSTEM SETTINGS
export const updateSystemSettings = async (req, res) => {
  try {
    const updateData = req.body;

    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "System settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update system settings error:", error);
    res.status(500).json({ success: false, message: "Server error updating system settings" });
  }
};

