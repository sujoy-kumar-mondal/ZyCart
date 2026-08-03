import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import CategoryAttribute from "../models/CategoryAttribute.js";

// ----------------------------------------------------------
// HELPER: Validate Attributes against Schema
// ----------------------------------------------------------
async function validateAttributes(mainCategory, subCategory, subSubCategory, providedAttributes) {
  try {
    console.log("🔍 Validating attributes for:", `${mainCategory}|${subCategory}|${subSubCategory}`);
    console.log("📝 Provided attributes:", providedAttributes);
    
    // Fetch the attribute schema for this category
    const schema = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
    });

    if (!schema || !schema.fields) {
      console.log(`⚠️ No attributes found for: ${mainCategory}|${subCategory}|${subSubCategory}`);
      // If no schema found, allow attributes to be saved as-is (validation disabled)
      return {
        valid: true,
        attributes: providedAttributes,
      };
    }

    console.log(`✅ Found schema with ${schema.fields.length} fields`);
    const errors = [];
    const validatedAttributes = {};

    // Check each field in the schema
    schema.fields.forEach((field) => {
      const providedValue = providedAttributes[field.fieldName];

      console.log(`  Field: ${field.fieldName}, Required: ${field.required}, Provided: ${providedValue}, DataType: ${field.dataType}`);

      // Check required fields
      if (field.required && (!providedValue || providedValue === "" || (Array.isArray(providedValue) && providedValue.length === 0))) {
        errors.push(`${field.fieldName} is required`);
        return;
      }

      // If provided, validate based on data type
      if (providedValue !== undefined && providedValue !== "" && (!Array.isArray(providedValue) || providedValue.length > 0)) {
        if (field.dataType === "Integer") {
          if (isNaN(parseInt(providedValue))) {
            errors.push(`${field.fieldName} must be a number`);
            return;
          }
          validatedAttributes[field.fieldName] = parseInt(providedValue);
        } else if (field.dataType === "Decimal") {
          if (isNaN(parseFloat(providedValue))) {
            errors.push(`${field.fieldName} must be a decimal number`);
            return;
          }
          validatedAttributes[field.fieldName] = parseFloat(providedValue);
        } else if (field.dataType === "Select") {
          if (field.options && field.options.length > 0 && !field.options.includes(providedValue)) {
            errors.push(
              `${field.fieldName} must be one of: ${field.options.join(", ")}`
            );
            return;
          }
          validatedAttributes[field.fieldName] = providedValue;
        } else if (field.dataType === "Multi-Select") {
          const values = Array.isArray(providedValue) ? providedValue : [providedValue];
          if (field.options && field.options.length > 0) {
            const invalidValues = values.filter((v) => !field.options.includes(v));
            if (invalidValues.length > 0) {
              errors.push(
                `${field.fieldName} contains invalid values: ${invalidValues.join(", ")}`
              );
              return;
            }
          }
          validatedAttributes[field.fieldName] = values;
        } else if (field.dataType === "Boolean") {
          if (!["Yes", "No"].includes(providedValue)) {
            errors.push(`${field.fieldName} must be Yes or No`);
            return;
          }
          validatedAttributes[field.fieldName] = providedValue;
        } else {
          // Text field (default)
          validatedAttributes[field.fieldName] = String(providedValue).trim();
        }
      }
    });

    if (errors.length > 0) {
      console.log("❌ Validation errors:", errors);
      return {
        valid: false,
        errors,
      };
    }

    console.log("✅ Validation passed");
    return {
      valid: true,
      attributes: validatedAttributes,
    };
  } catch (error) {
    console.error("Attribute validation error:", error);
    return {
      valid: false,
      errors: ["Error validating attributes"],
    };
  }
}

// ----------------------------------------------------------
// ADD PRODUCT (Updated with attribute validation)
// ----------------------------------------------------------
export const addProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    let { title, price, stock, description, mainCategory, subCategory, subSubCategory, attributes, discount, discountPeriod, maxQuantityPerPurchase } = req.body;
    const imageUrls = req.fileUrls || [];

    // Parse attributes if it's a JSON string (from FormData)
    if (typeof attributes === "string") {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        console.error("Error parsing attributes:", e);
        attributes = {};
      }
    }

    console.log("📦 Received attributes:", attributes);
    console.log("🔑 Attribute keys:", Object.keys(attributes || {}));

    if (!title || !price || !stock || !mainCategory || !subCategory || !subSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, price, stock, and categories are required.",
      });
    }

    if (!attributes || Object.keys(attributes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product attributes are required.",
      });
    }

    // Validate attributes against schema
    const validation = await validateAttributes(
      mainCategory,
      subCategory,
      subSubCategory,
      attributes
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Attribute validation failed",
        errors: validation.errors,
      });
    }

    const product = await Product.create({
      title,
      price,
      stock,
      description,
      images: imageUrls.length > 0 ? imageUrls : [],
      seller: sellerId,
      mainCategory,
      subCategory,
      subSubCategory,
      attributes: validation.attributes, // Use validated attributes
      discount: discount ? parseInt(discount) : 0,
      discountPeriod: discountPeriod ? new Date(discountPeriod) : null,
      maxQuantityPerPurchase: maxQuantityPerPurchase ? parseInt(maxQuantityPerPurchase) : null,
    });

    // Increase seller product count
    await Seller.findByIdAndUpdate(sellerId, { $inc: { totalProducts: 1 } });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SELLER BY ID
// ----------------------------------------------------------
export const getSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // Populate user info with error handling
    const sellerWithUser = await Seller.findById(id).populate({
      path: "user",
      select: "name email phone avatar",
    }).catch(err => {
      // If populate fails due to schema issues, just return seller without user
      return Seller.findById(id).select(
        "user shopName shopDescription shopImage rating totalOrders totalEarnings isVerified"
      );
    });

    if (!sellerWithUser) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    return res.status(200).json({
      success: true,
      seller: sellerWithUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error fetching seller", error: err.message });
  }
};

// ----------------------------------------------------------
// SELLER APPLY (LEGACY - DEPRECATED)
// Sellers now register via /seller/send-otp → /seller/verify-otp → /seller/submit-details
// This endpoint kept for backward compatibility
// ----------------------------------------------------------
export const applySeller = async (req, res) => {
  try {
    return res.status(400).json({
      success: false,
      message: "Seller registration via this endpoint is deprecated. Use /api/auth/seller/send-otp instead.",
    });
  } catch (error) {
    console.error("Apply seller error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// SELLER DASHBOARD
// ----------------------------------------------------------
export const sellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const totalProducts = await Product.countDocuments({ seller: sellerId });

    const totalOrders = await Order.countDocuments({
      "childOrders.seller": sellerId,
    });

    const pendingShipments = await Order.countDocuments({
      "childOrders.seller": sellerId,
      "childOrders.status": { $ne: "Shipped" },
    });

    const seller = await Seller.findById(sellerId).select("-password -otp");

    res.status(200).json({
      success: true,
      seller,
      totalProducts,
      totalOrders,
      pendingShipments,
    });
  } catch (error) {
    console.error("Seller dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE PRODUCT
// ----------------------------------------------------------
export const updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Now comes from Seller collection directly
    const { id } = req.params;

    let { title, price, stock, description, mainCategory, subCategory, subSubCategory, attributes, discount, discountPeriod, maxQuantityPerPurchase } = req.body;
    const newImages = req.fileUrls || [];

    // Parse attributes if it's a JSON string (from FormData)
    if (attributes && typeof attributes === "string") {
      try {
        attributes = JSON.parse(attributes);
      } catch (e) {
        console.error("Error parsing attributes:", e);
        attributes = {};
      }
    }

    const product = await Product.findOne({ _id: id, seller: sellerId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // If category changed or attributes provided, validate attributes
    if (mainCategory || subCategory || subSubCategory || attributes) {
      const catMain = mainCategory || product.mainCategory;
      const catSub = subCategory || product.subCategory;
      const catSubSub = subSubCategory || product.subSubCategory;
      const attrs = attributes || product.attributes;

      const validation = await validateAttributes(catMain, catSub, catSubSub, attrs);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Attribute validation failed",
          errors: validation.errors,
        });
      }

      product.mainCategory = catMain;
      product.subCategory = catSub;
      product.subSubCategory = catSubSub;
      product.attributes = validation.attributes;
    }

    product.title = title || product.title;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.description = description || product.description;
    product.discount = discount !== undefined && discount !== "" ? parseInt(discount) : product.discount;
    product.discountPeriod = discountPeriod !== undefined && discountPeriod !== "" ? new Date(discountPeriod) : product.discountPeriod;
    product.maxQuantityPerPurchase = maxQuantityPerPurchase !== undefined && maxQuantityPerPurchase !== "" ? parseInt(maxQuantityPerPurchase) : product.maxQuantityPerPurchase;

    if (newImages.length > 0) {
      product.images = newImages; // replace all images
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// MARK PRODUCT AS UNAVAILABLE
// ----------------------------------------------------------
export const markUnavailable = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: sellerId },
      { isAvailable: false },
      { new: true }
    );

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });

    res.status(200).json({
      success: true,
      message: "Product marked unavailable.",
    });
  } catch (error) {
    console.error("Unavailable error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// MARK PRODUCT AS AVAILABLE
// ----------------------------------------------------------
export const markAvailable = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: sellerId },
      { isAvailable: true },
      { new: true }
    );

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });

    res.status(200).json({
      success: true,
      message: "Product marked available.",
    });
  } catch (error) {
    console.error("Available error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// DELETE PRODUCT
// ----------------------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const product = await Product.findOneAndDelete(
      { _id: id, seller: sellerId }
    );

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });

    // Decrease seller product count
    await Seller.findByIdAndUpdate(sellerId, { $inc: { totalProducts: -1 } });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SELLER PRODUCTS
// ----------------------------------------------------------
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const products = await Product.find({ seller: sellerId });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SELLER CHILD ORDERS
// ----------------------------------------------------------
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const orders = await Order.find({
      "childOrders.seller": sellerId,
    }).select("parentOrderNumber childOrders");

    // Filter only this seller's child orders
    const filtered = [];

    orders.forEach((order) => {
      order.childOrders.forEach((child) => {
        if (child.seller.toString() === sellerId.toString()) {
          filtered.push({
            _id: child._id,
            parentOrderId: order,
            items: child.items,
            amount: child.amount,
            status: child.status,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      orders: filtered,
    });
  } catch (error) {
    console.error("Seller orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE SELLER CHILD ORDER STATUS
// ----------------------------------------------------------
export const updateChildOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // child order ID
    const { status } = req.body;
    const sellerId = req.user.userId; // Now comes from Seller collection directly

    const order = await Order.findOne({
      "childOrders._id": id,
      "childOrders.seller": sellerId,
    });

    if (!order)
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });

    // Update child order status
    const child = order.childOrders.id(id);
    child.status = status;

    await order.save();

    // After saving, check if all child orders shipped
    const allShipped = order.childOrders.every((c) => c.status === "Shipped");

    if (allShipped) {
      order.status = "Shipped";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Update child order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SELLER ORDER DETAILS BY ID
// ----------------------------------------------------------
export const getSellerOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user.userId;

    // Find the order with this child order
    const order = await Order.findOne({
      "childOrders._id": orderId,
      "childOrders.seller": sellerId,
    }).populate("user", "_id name email mobile");

    console.log("Found order:", order ? "Yes" : "No");
    console.log("User data:", order?.user);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Get the specific child order
    const childOrder = order.childOrders.find(c => c._id.toString() === orderId);
    if (!childOrder) {
      return res.status(404).json({
        success: false,
        message: "Child order not found",
      });
    }

    // Manually populate seller info
    const seller = await Seller.findById(childOrder.seller).select("shopName");

    // Ensure user data is available
    const userData = order.user ? {
      _id: order.user._id,
      name: order.user.name || 'N/A',
      email: order.user.email || 'N/A',
      mobile: order.user.mobile || 'N/A'
    } : { name: 'N/A', email: 'N/A', mobile: 'N/A' };

    console.log("Sending userData:", userData);

    res.status(200).json({
      success: true,
      order: {
        _id: childOrder._id,
        parentOrderId: {
          _id: order._id,
          parentOrderNumber: order.parentOrderNumber,
          address: order.address,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
        },
        items: childOrder.items,
        amount: childOrder.amount,
        status: childOrder.status,
        seller: seller,
        userId: userData,
      },
    });
  } catch (error) {
    console.error("Get seller order details error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET SELLER PROFILE
// ----------------------------------------------------------
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.userId).select("-password -otp");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// UPDATE SELLER PROFILE
// ----------------------------------------------------------
export const updateSellerProfile = async (req, res) => {
  try {
    const { name, mobile, shopName, shopType, pan, aadhar, bankAccount, gst, address } = req.body;

    const updated = await Seller.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        mobile,
        shopName,
        shopType,
        pan,
        aadhar,
        bankAccount,
        gst,
        ...(address && { address }),
      },
      { new: true }
    ).select("-password -otp");

    res.status(200).json({
      success: true,
      seller: updated,
    });
  } catch (error) {
    console.error("Update seller profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
