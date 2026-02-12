import express from "express";

const router = express.Router();

// Note: These endpoints will work with the Category model
// Import this in your server.js and add to routes

// GET all main categories
// GET /api/categories/main
export const getAllMainCategories = async (req, res) => {
  try {
    const Category = req.app.locals.Category;

    const mainCategories = await Category.distinct("mainCategory");

    res.status(200).json({
      success: true,
      count: mainCategories.length,
      data: mainCategories.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET sub-categories for a main category
// GET /api/categories/sub/:mainCategory
export const getSubCategories = async (req, res) => {
  try {
    const { mainCategory } = req.params;
    const Category = req.app.locals.Category;

    const subCategories = await Category.distinct("subCategory", {
      mainCategory,
    });

    if (subCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Main category not found",
      });
    }

    res.status(200).json({
      success: true,
      mainCategory,
      count: subCategories.length,
      data: subCategories.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET sub-sub-categories for a sub-category
// GET /api/categories/subsub/:mainCategory/:subCategory
export const getSubSubCategories = async (req, res) => {
  try {
    const { mainCategory, subCategory } = req.params;
    const Category = req.app.locals.Category;

    const subSubCategories = await Category.distinct("subSubCategory", {
      mainCategory,
      subCategory,
    });

    if (subSubCategories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sub-category not found",
      });
    }

    res.status(200).json({
      success: true,
      mainCategory,
      subCategory,
      count: subSubCategories.length,
      data: subSubCategories.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET all categories (complete hierarchy)
// GET /api/categories/all
export const getAllCategories = async (req, res) => {
  try {
    const Category = req.app.locals.Category;

    const categories = await Category.find({ isActive: true });

    // Organize into hierarchy
    const hierarchy = {};

    categories.forEach((cat) => {
      if (!hierarchy[cat.mainCategory]) {
        hierarchy[cat.mainCategory] = {};
      }
      if (!hierarchy[cat.mainCategory][cat.subCategory]) {
        hierarchy[cat.mainCategory][cat.subCategory] = [];
      }
      hierarchy[cat.mainCategory][cat.subCategory].push(cat.subSubCategory);
    });

    res.status(200).json({
      success: true,
      totalCategories: categories.length,
      data: hierarchy,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET category statistics
// GET /api/categories/stats
export const getCategoryStats = async (req, res) => {
  try {
    const Category = req.app.locals.Category;

    const mainCats = await Category.distinct("mainCategory");
    const subCats = await Category.distinct("subCategory");
    const subSubCats = await Category.distinct("subSubCategory");
    const total = await Category.countDocuments();

    const stats = {
      totalCategories: total,
      mainCategories: mainCats.length,
      subCategories: subCats.length,
      subSubCategories: subSubCats.length,
      breakdown: {},
    };

    // Detailed breakdown
    for (const mainCat of mainCats) {
      const subCount = await Category.distinct("subCategory", {
        mainCategory: mainCat,
      });
      const itemCount = await Category.countDocuments({
        mainCategory: mainCat,
      });

      stats.breakdown[mainCat] = {
        subCategories: subCount.length,
        items: itemCount,
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default router;
