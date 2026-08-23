import Seller from "../models/Seller.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import CategoryAttribute from "../models/CategoryAttribute.js";
import SystemSetting from "../models/SystemSetting.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to extract Cloudinary Public ID from image URL
export const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    let pathAfterUpload = parts[1];
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, ""); // remove version (v12345/)
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, ""); // remove extension (.jpg, .png)
    return publicId;
  } catch (err) {
    console.error("Error extracting Cloudinary public_id:", err);
    return null;
  }
};

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
        } else if (field.dataType === "Date") {
          if (isNaN(Date.parse(providedValue))) {
            errors.push(`${field.fieldName} must be a valid date`);
            return;
          }
          validatedAttributes[field.fieldName] = providedValue;
        } else if (field.dataType === "Boolean") {
          if (!["Yes", "No", true, false, "true", "false"].includes(providedValue)) {
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

    let { title, price, stock, description, mainCategory, subCategory, subSubCategory, attributes, discount, discountedPrice, discountPeriod, maxQuantityPerPurchase } = req.body;
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

    // Check seller product quota from system settings
    const settings = await SystemSetting.findOne();
    const maxAllowedProducts = settings?.maxProductsPerSeller ?? 50;
    const currentProductCount = await Product.countDocuments({ seller: sellerId });

    if (currentProductCount >= maxAllowedProducts) {
      return res.status(400).json({
        success: false,
        message: `Product listing quota reached. You can list a maximum of ${maxAllowedProducts} products on ZyCart.`,
      });
    }

    if (!title || !price || !stock || !mainCategory || !subCategory || !subSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Title, price, stock, and categories are required.",
      });
    }

    // 1. Max Quantity Per Purchase validation
    const parsedStock = parseInt(stock);
    const parsedPrice = parseFloat(price);
    const parsedMaxQty = maxQuantityPerPurchase ? parseInt(maxQuantityPerPurchase) : null;
    if (!parsedMaxQty || isNaN(parsedMaxQty) || parsedMaxQty < 1 || parsedMaxQty > 25) {
      return res.status(400).json({
        success: false,
        message: "Max Quantity Per Purchase must be between 1 and 25.",
      });
    }
    if (parsedMaxQty >= parsedStock) {
      return res.status(400).json({
        success: false,
        message: "Max Quantity Per Purchase must be less than Stock Quantity.",
      });
    }

    // 2. Discounted Price & Discount Expiry Date validation
    let parsedDiscountedPrice = discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "" ? parseFloat(discountedPrice) : null;
    let parsedDiscount = discount ? parseInt(discount) : 0;
    if (parsedDiscountedPrice !== null) {
      if (isNaN(parsedDiscountedPrice) || parsedDiscountedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discounted Price must be a positive number.",
        });
      }
      if (parsedDiscountedPrice >= parsedPrice) {
        return res.status(400).json({
          success: false,
          message: "Discounted Price must be less than original Price.",
        });
      }
      parsedDiscount = Math.round(((parsedPrice - parsedDiscountedPrice) / parsedPrice) * 100);
    } else if (parsedDiscount > 0) {
      parsedDiscountedPrice = Math.round(parsedPrice * (1 - parsedDiscount / 100));
    }

    // 3. Image Count Validation (at least 2 images, max 10 images)
    if (imageUrls.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 product images must be uploaded.",
      });
    }
    if (imageUrls.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 product images allowed.",
      });
    }

    const attrs = attributes || {};

    // Validate attributes against schema
    const validation = await validateAttributes(
      mainCategory,
      subCategory,
      subSubCategory,
      attrs
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
      images: imageUrls,
      seller: sellerId,
      mainCategory,
      subCategory,
      subSubCategory,
      attributes: validation.attributes,
      discount: parsedDiscount,
      discountedPrice: parsedDiscount > 0 ? parsedDiscountedPrice : null,
      discountPeriod: parsedDiscount > 0 && discountPeriod ? new Date(discountPeriod) : null,
      maxQuantityPerPurchase: parsedMaxQty,
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

    let { title, price, stock, description, mainCategory, subCategory, subSubCategory, attributes, discount, discountedPrice, discountPeriod, maxQuantityPerPurchase } = req.body;
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

    // Validate Max Quantity Per Purchase
    const finalStock = stock !== undefined && stock !== "" ? parseInt(stock) : product.stock;
    const finalPrice = price !== undefined && price !== "" ? parseFloat(price) : product.price;
    const finalMaxQty = maxQuantityPerPurchase !== undefined && maxQuantityPerPurchase !== "" ? parseInt(maxQuantityPerPurchase) : product.maxQuantityPerPurchase;

    if (isNaN(finalMaxQty) || finalMaxQty < 1 || finalMaxQty > 25) {
      return res.status(400).json({
        success: false,
        message: "Max Quantity Per Purchase must be between 1 and 25.",
      });
    }

    if (finalMaxQty >= finalStock) {
      return res.status(400).json({
        success: false,
        message: "Max Quantity Per Purchase must be less than Stock Quantity.",
      });
    }

    product.maxQuantityPerPurchase = finalMaxQty;

    // Validate Discounted Price / Discount & Expiry Date
    let finalDiscount = discount !== undefined && discount !== "" ? parseInt(discount) : product.discount;
    let finalDiscountedPrice = discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "" ? parseFloat(discountedPrice) : product.discountedPrice;

    if (discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "") {
      const parsedDiscountedPrice = parseFloat(discountedPrice);
      if (isNaN(parsedDiscountedPrice) || parsedDiscountedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Discounted Price must be a positive number.",
        });
      }
      if (parsedDiscountedPrice >= finalPrice) {
        return res.status(400).json({
          success: false,
          message: "Discounted Price must be less than original Price.",
        });
      }
      finalDiscount = Math.round(((finalPrice - parsedDiscountedPrice) / finalPrice) * 100);
      finalDiscountedPrice = parsedDiscountedPrice;
    } else if (discount !== undefined && discount !== "") {
      finalDiscountedPrice = finalDiscount > 0 ? Math.round(finalPrice * (1 - finalDiscount / 100)) : null;
    }

    let finalDiscountPeriod = null;
    if (discountPeriod !== undefined && discountPeriod !== null && discountPeriod !== "") {
      finalDiscountPeriod = new Date(discountPeriod);
    } else if (discountPeriod === "" || discountPeriod === null) {
      finalDiscountPeriod = null;
    } else {
      finalDiscountPeriod = product.discountPeriod;
    }

    product.title = title || product.title;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.description = description || product.description;
    product.discount = finalDiscount;
    product.discountedPrice = finalDiscount > 0 ? finalDiscountedPrice : null;
    product.discountPeriod = finalDiscount > 0 ? finalDiscountPeriod : null;

    let existingImages = req.body.existingImages;
    if (existingImages) {
      if (typeof existingImages === "string") {
        existingImages = [existingImages];
      }
    } else {
      existingImages = [];
    }

    const uploadedNewImages = req.fileUrls || [];

    let finalImages = [];
    if (req.body.imageOrder) {
      try {
        const imageOrder = typeof req.body.imageOrder === "string" ? JSON.parse(req.body.imageOrder) : req.body.imageOrder;
        let newIdx = 0;

        finalImages = imageOrder.map((item) => {
          if (item === "NEW_FILE") {
            const url = uploadedNewImages[newIdx];
            newIdx++;
            return url;
          } else {
            return item;
          }
        }).filter(Boolean);
      } catch (err) {
        finalImages = [...existingImages, ...uploadedNewImages];
      }
    } else if (existingImages.length > 0 || uploadedNewImages.length > 0) {
      finalImages = [...existingImages, ...uploadedNewImages];
    }

    if (finalImages.length > 0) {
      if (finalImages.length < 2 || finalImages.length > 10) {
        return res.status(400).json({
          success: false,
          message: "Product must have between 2 and 10 images.",
        });
      }
      product.images = finalImages;
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
    const sellerId = req.user.userId || req.user._id;

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
    const sellerId = req.user.userId || req.user._id;

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
// DELETE PRODUCT (With Cloudinary Image Deletion)
// ----------------------------------------------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId || req.user._id;

    // Find the product first to verify ownership and access its images
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Ensure ownership matching both String and ObjectId formats
    if (product.seller.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product.",
      });
    }

    // Delete associated images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imgUrl of product.images) {
        const publicId = extractCloudinaryPublicId(imgUrl);
        if (publicId) {
          try {
            console.log(`🗑️ Deleting Cloudinary image: ${publicId}`);
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.error(`⚠️ Failed to delete Cloudinary image (${publicId}):`, cloudErr.message);
          }
        }
      }
    }

    // Remove product from database
    await Product.findByIdAndDelete(product._id);

    // Decrease seller product count
    await Seller.findByIdAndUpdate(sellerId, { $inc: { totalProducts: -1 } });

    res.status(200).json({
      success: true,
      message: "Product and associated images deleted successfully.",
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
    }).select("parentOrderNumber childOrders createdAt placedAt confirmedAt packedAt shippedAt deliveredAt");

    // Filter only this seller's child orders
    const filtered = [];

    const settings = await SystemSetting.findOne();
    const activeCommissionRate = settings?.platformCommissionRate ?? 5;

    orders.forEach((order) => {
      order.childOrders.forEach((child) => {
        if (child.seller.toString() === sellerId.toString()) {
          const rate = activeCommissionRate;
          const commAmt = Math.round((child.amount * rate) / 100);
          const earnings = child.amount - commAmt;

          filtered.push({
            _id: child._id,
            parentOrderId: order,
            items: child.items,
            amount: child.amount,
            commissionRate: rate,
            commissionAmount: commAmt,
            sellerEarnings: earnings,
            status: child.status,
            createdAt: child.createdAt || order.createdAt,
            placedAt: child.placedAt || order.placedAt || order.createdAt,
            packedAt: child.packedAt || order.packedAt,
            shippedAt: child.shippedAt || order.shippedAt,
            deliveredAt: child.deliveredAt || order.deliveredAt,
            cancelledAt: child.cancelledAt || order.cancelledAt,
            cancelledBy: child.cancelledBy || order.cancelledBy,
            cancellationReason: child.cancellationReason || order.cancellationReason,
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

    // Update child order status and timestamp
    const child = order.childOrders.id(id);
    child.status = status;
    const now = new Date();
    if (status === "Confirmed" && !child.confirmedAt) child.confirmedAt = now;
    if (status === "Packed" && !child.packedAt) child.packedAt = now;
    if (status === "Shipped" && !child.shippedAt) child.shippedAt = now;
    if (status === "Delivered" && !child.deliveredAt) child.deliveredAt = now;
    if (status === "Cancelled" && !child.cancelledAt) child.cancelledAt = now;

    // Update parent order timestamps if applicable
    const anyPacked = order.childOrders.some((c) => c.status === "Packed" || c.status === "Shipped" || c.status === "Delivered");
    if (anyPacked && !order.packedAt) {
      order.packedAt = now;
    }

    const allShipped = order.childOrders.every((c) => c.status === "Shipped" || c.status === "Delivered");
    if (allShipped) {
      order.status = "Shipped";
      if (!order.shippedAt) order.shippedAt = now;
    }

    const allDelivered = order.childOrders.every((c) => c.status === "Delivered");
    if (allDelivered) {
      order.status = "Delivered";
      if (!order.deliveredAt) order.deliveredAt = now;
      order.paymentStatus = "completed";
    }

    await order.save();

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

    const settings = await SystemSetting.findOne();
    const activeCommissionRate = settings?.platformCommissionRate ?? 5;
    const rate = activeCommissionRate;
    const commAmt = Math.round((childOrder.amount * rate) / 100);
    const earnings = childOrder.amount - commAmt;

    res.status(200).json({
      success: true,
      order: {
        _id: childOrder._id,
        parentOrderId: {
          _id: order._id,
          parentOrderNumber: order.parentOrderNumber,
          address: order.address,
          createdAt: order.createdAt,
          placedAt: order.placedAt,
          confirmedAt: order.confirmedAt,
          packedAt: order.packedAt,
          shippedAt: order.shippedAt,
          outForDeliveryAt: order.outForDeliveryAt,
          deliveredAt: order.deliveredAt,
          cancelledAt: order.cancelledAt,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
        },
        items: childOrder.items,
        amount: childOrder.amount,
        commissionRate: rate,
        commissionAmount: commAmt,
        sellerEarnings: earnings,
        status: childOrder.status,
        placedAt: childOrder.placedAt || order.placedAt || order.createdAt,
        confirmedAt: childOrder.confirmedAt || order.confirmedAt || order.createdAt,
        packedAt: childOrder.packedAt || order.packedAt,
        shippedAt: childOrder.shippedAt || order.shippedAt,
        deliveredAt: childOrder.deliveredAt || order.deliveredAt,
        cancelledAt: childOrder.cancelledAt || order.cancelledAt,
        cancelledBy: childOrder.cancelledBy || order.cancelledBy,
        cancellationReason: childOrder.cancellationReason || order.cancellationReason,
        createdAt: childOrder.createdAt || order.createdAt,
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

// ----------------------------------------------------------
// CANCEL SELLER CHILD ORDER (Merchant)
// ----------------------------------------------------------
export const cancelSellerChildOrder = async (req, res) => {
  try {
    const { id } = req.params; // child order ID
    const { reason } = req.body;
    const sellerId = req.user.userId;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required.",
      });
    }

    const order = await Order.findOne({
      "childOrders._id": id,
      "childOrders.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or unauthorized.",
      });
    }

    const child = order.childOrders.id(id);
    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    if (["Shipped", "Delivered", "Cancelled"].includes(child.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a package that is already ${child.status}.`,
      });
    }

    const now = new Date();
    const cleanReason = reason.trim();

    child.status = "Cancelled";
    child.cancelledAt = now;
    child.cancelledBy = "Seller";
    child.cancellationReason = cleanReason;

    // Restore inventory stock for this merchant package
    for (const item of child.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.qty },
        });
      }
    }

    // Check if ALL child orders are now cancelled
    const allCancelled = order.childOrders.every((c) => c.status === "Cancelled");
    if (allCancelled) {
      order.status = "Cancelled";
      if (!order.cancelledAt) order.cancelledAt = now;
      if (!order.cancelledBy) order.cancelledBy = "Seller";
      if (!order.cancellationReason) order.cancellationReason = cleanReason;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Package cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Cancel seller child order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
