import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Trend from "../models/Trend.js";
import { getMainCategories, getSubCategories, getSubSubCategories, getAttributesForCategory } from "../utils/categories.js";

// ----------------------------------------------------------
// GET ALL PRODUCTS (Homepage)
// ----------------------------------------------------------
// Only show products where:
// 1. isAvailable = true
// 2. Seller is approved AND NOT banned
// ----------------------------------------------------------
export const getAllProductsHome = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "isApproved isBanned shopName");

    // Filter: hide products of banned/unapproved sellers
    const filtered = products.filter(
      (p) => p.seller?.isApproved && !p.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      products: filtered,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const {
      search = "",
      mainCategory = "",
      subCategory = "",
      subSubCategory = "",
      brand = "",
      sort = "",
      page = 1,
      limit = 12,
      min = 0,
      max = 9999999,
      filters = {},
    } = req.query;

    const query = {
      price: { $gte: Number(min), $lte: Number(max) }
    };

    if (search) query.title = { $regex: search, $options: "i" };
    if (mainCategory) query.mainCategory = mainCategory;
    if (subCategory) query.subCategory = subCategory;
    if (subSubCategory) query.subSubCategory = subSubCategory;
    if (brand) query.brand = { $regex: brand, $options: "i" };

    // Handle dynamic attribute filters
    if (filters && typeof filters === 'object') {
      Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key]) && filters[key].length > 0) {
          query[`attributes.${key}`] = { $in: filters[key] };
        }
      });
    }
    if (brand) query.brand = { $regex: brand, $options: "i" };

    let sortQuery = {};

    if (sort === "low-high") sortQuery.price = 1;
    if (sort === "high-low") sortQuery.price = -1;
    if (sort === "newest") sortQuery.createdAt = -1;
    if (sort === "oldest") sortQuery.createdAt = 1;
    if (sort === "name-asc") sortQuery.title = 1;
    if (sort === "name-desc") sortQuery.title = -1;

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ----------------------------------------------------------
// GET SINGLE PRODUCT BY ID
// ----------------------------------------------------------
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "shopName isApproved isBanned"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    // Hide products from banned/unapproved sellers
    if (!product.seller.isApproved || product.seller.isBanned) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get single product error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// STOCK VALIDATION FOR CART
// ----------------------------------------------------------
// Checks before adding to cart:
// If stock = 6 → user cannot add > 6
// ----------------------------------------------------------
export const checkStock = async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isAvailable) {
      return res.status(404).json({
        success: false,
        message: "Product unavailable",
      });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock valid",
    });
  } catch (error) {
    console.error("Stock check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateTrendPurchase = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const trend = await Trend.findOneAndUpdate(
      { product: productId },
      { $inc: { noOfPurchase: quantity } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Purchase count updated",
      trend,
    });

  } catch (error) {
    console.error("updateTrendPurchase error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update purchase trend",
    });
  }
};

export const updateTrendView = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?._id; // Get user ID from auth

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if user has already viewed this product
    const trend = await Trend.findOne({ product: productId });
    
    let shouldIncrement = false;
    if (!trend) {
      // First view ever
      shouldIncrement = true;
    } else if (userId && !trend.viewers.includes(userId)) {
      // User hasn't viewed this product before
      shouldIncrement = true;
    }

    // Update trend with new view count and add user to viewers
    const updateData = shouldIncrement 
      ? { $inc: { noOfViews: 1 } }
      : {};
    
    if (userId && shouldIncrement) {
      updateData.$addToSet = { viewers: userId };
    } else if (userId && !shouldIncrement) {
      // User has already viewed, but still ensure they're in the viewers array
      updateData.$addToSet = { viewers: userId };
    }

    const updatedTrend = await Trend.findOneAndUpdate(
      { product: productId },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "View count updated",
      trend: updatedTrend,
    });

  } catch (error) {
    console.error("updateTrendView error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update view trend",
    });
  }
};

export const getTopPurchaseTrends = async (req, res) => {
  try {
    const trends = await Trend.find()
      .populate({
        path: "product",
        populate: { path: "seller", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfPurchase: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.seller?.isApproved && !t.product?.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      trends: filtered,
    });
  } catch (error) {
    console.error("Get top purchase trends error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTopViewTrends = async (req, res) => {
  try {
    const trends = await Trend.find()
      .populate({
        path: "product",
        populate: { path: "seller", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfViews: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.seller?.isApproved && !t.product?.seller?.isBanned
    );

    res.status(200).json({
      success: true,
      trends: filtered,
    });
  } catch (error) {
    console.error("Get top view trends error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// CATEGORY FUNCTIONS
// ----------------------------------------------------------
export const getCategories = async (req, res) => {
  try {
    const mainCategories = getMainCategories();
    res.status(200).json({
      success: true,
      categories: mainCategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubCategoriesRoute = async (req, res) => {
  try {
    const { main } = req.params;
    const subCategories = getSubCategories(main);
    res.status(200).json({
      success: true,
      subCategories,
    });
  } catch (error) {
    console.error("Get sub categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubSubCategoriesRoute = async (req, res) => {
  try {
    const { main, sub } = req.params;
    const subSubCategories = getSubSubCategories(main, sub);
    res.status(200).json({
      success: true,
      subSubCategories,
    });
  } catch (error) {
    console.error("Get sub sub categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAttributes = async (req, res) => {
  try {
    const { main, sub, subsub } = req.params;
    console.log("🔍 Attributes request:", { main, sub, subsub });
    const attributes = await getAttributesForCategory(main, sub, subsub);
    console.log("📋 Returned attributes:", attributes);
    res.status(200).json({
      success: true,
      attributes,
    });
  } catch (error) {
    console.error("Get attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};