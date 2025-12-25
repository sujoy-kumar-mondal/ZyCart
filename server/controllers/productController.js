import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Trend from "../models/Trend.js";

// ----------------------------------------------------------
// GET ALL PRODUCTS (Homepage)
// ----------------------------------------------------------
// Only show products where:
// 1. isAvailable = true
// 2. Supplier is approved AND NOT banned
// ----------------------------------------------------------
export const getAllProductsHome = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("supplier", "isApproved isBanned shopName");

    // Filter: hide products of banned/unapproved suppliers
    const filtered = products.filter(
      (p) => p.supplier?.isApproved && !p.supplier?.isBanned
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
      category = "",
      brand = "",
      sort = "",
      page = 1,
      limit = 12,
      min = 0,
      max = 9999999,
    } = req.query;

    const query = {
      price: { $gte: Number(min), $lte: Number(max) }
    };

    if (search) query.title = { $regex: search, $options: "i" };
    if (category) query.category = category;
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
      "supplier",
      "shopName isApproved isBanned"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    // Hide products from banned/unapproved suppliers
    if (!product.supplier.isApproved || product.supplier.isBanned) {
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
    const { productId, quantity } = req.body;

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

    // Validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const trend = await Trend.findOneAndUpdate(
      { product: productId },
      { $inc: { noOfViews: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "View count updated",
      trend,
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
        populate: { path: "supplier", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfPurchase: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.supplier?.isApproved && !t.product?.supplier?.isBanned
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
        populate: { path: "supplier", select: "isApproved isBanned shopName" },
      })
      .sort({ noOfViews: -1 })
      .limit(10);

    const filtered = trends.filter(
      (t) => t.product?.isAvailable && t.product?.supplier?.isApproved && !t.product?.supplier?.isBanned
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