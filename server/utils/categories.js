import Category from "../models/Category.js";
import CategoryAttribute from "../models/CategoryAttribute.js";

// Cache for category data (populate from DB)
let categoryCache = {
  mainCategories: [],
  subCategories: {},
  subSubCategories: {},
};

// Flag to track if cache is initialized
let cacheInitialized = false;
let initializationPromise = null;

// Initialize cache from database
export const initializeCategoryCache = async () => {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  // If already initialized, return immediately
  if (cacheInitialized) {
    return Promise.resolve();
  }

  // Create the initialization promise
  initializationPromise = (async () => {
    try {
      // Get all unique main categories
      const mainCategories = await Category.distinct("mainCategory");
      categoryCache.mainCategories = mainCategories.sort();

      // Get all unique sub categories for each main category
      for (const mainCat of mainCategories) {
        const subCategories = await Category.distinct("subCategory", {
          mainCategory: mainCat,
        });
        categoryCache.subCategories[mainCat] = subCategories.sort();

        // Get all unique sub-sub categories for each sub category
        for (const subCat of subCategories) {
          const key = `${mainCat}|${subCat}`;
          const subSubCategories = await Category.distinct("subSubCategory", {
            mainCategory: mainCat,
            subCategory: subCat,
          });
          categoryCache.subSubCategories[key] = subSubCategories.sort();
        }
      }

      cacheInitialized = true;
      return true;
    } catch (error) {
      throw error;
    }
  })();

  return initializationPromise;
};

// Sample attributes for different product types
const sampleAttributes = {
  "Electronics|Mobiles & Accessories|Mobiles": {
    brand: { type: "string", required: true },
    model: { type: "string", required: true },
    color: { type: "string", required: true, options: ["Black", "White", "Silver", "Gold", "Blue"] },
    storage: { type: "string", required: true, options: ["64GB", "128GB", "256GB", "512GB"] },
    ram: { type: "string", required: true, options: ["4GB", "6GB", "8GB", "12GB", "16GB"] },
    screenSize: { type: "string", required: true },
    battery: { type: "string", required: true },
    os: { type: "string", required: true, options: ["Android", "iOS"] },
  },
  "Electronics|Mobiles & Accessories|Mobile Accessories": {
    type: { type: "string", required: true, options: ["Case", "Screen Protector", "Charger", "Headphones", "Power Bank"] },
    material: { type: "string", required: false, options: ["Plastic", "Leather", "Silicone", "Metal"] },
    color: { type: "string", required: false },
    compatibility: { type: "string", required: true },
  },
  "Electronics|Laptops|Gaming Laptops": {
    brand: { type: "string", required: true },
    processor: { type: "string", required: true },
    ram: { type: "string", required: true, options: ["8GB", "16GB", "32GB"] },
    storage: { type: "string", required: true },
    graphics: { type: "string", required: true },
    screenSize: { type: "string", required: true },
    color: { type: "string", required: false },
  },
  "Fashion|Clothing and Accessories|Topwear": {
    brand: { type: "string", required: true },
    size: { type: "string", required: true, options: ["XS", "S", "M", "L", "XL", "XXL"] },
    color: { type: "string", required: true },
    material: { type: "string", required: true, options: ["Cotton", "Polyester", "Silk", "Wool", "Blend"] },
    fit: { type: "string", required: false, options: ["Regular", "Slim", "Oversized"] },
  },
  "Home & Kitchen|Kitchen, Cookware & Serveware|Cookware": {
    material: { type: "string", required: true, options: ["Stainless Steel", "Non-stick", "Cast Iron", "Ceramic"] },
    capacity: { type: "string", required: true, options: ["1L", "2L", "3L", "5L"] },
    color: { type: "string", required: false },
    pieces: { type: "string", required: false },
  },
};

// Function to get attributes for a specific subSubCategory
export const getAttributesForCategory = async (main, sub, subsub) => {
  try {
    const key = `${main}|${sub}|${subsub}`;
    
    // Query the database for attributes
    const attributeRecord = await CategoryAttribute.findOne({
      mainCategory: main,
      subCategory: sub,
      subSubCategory: subsub,
    });
    
    if (!attributeRecord) {
      const attributes = sampleAttributes[key] || {};
      return attributes;
    }
    
    // Convert database format to full metadata format for frontend
    const attributesObj = {};
    if (attributeRecord.fields && Array.isArray(attributeRecord.fields)) {
      attributeRecord.fields.forEach(field => {
        attributesObj[field.fieldName] = {
          fieldName: field.fieldName,
          dataType: field.dataType, // Keep original case: "Text", "Select", "Multi-Select", "Integer", "Decimal", "Boolean"
          required: field.required || false,
          filterable: field.filterable || false,
          options: field.options || [], // Array of valid values for Select/Multi-Select
          displayOrder: field.displayOrder || 0,
          placeholder: field.placeholder || "",
          helpText: field.helpText || "",
        };
      });
    }
    
    return attributesObj;
  } catch (error) {
    // Return empty object on error
    return {};
  }
};

// Function to get all main categories
export const getMainCategories = () => {
  return categoryCache.mainCategories || [];
};

// Function to get sub categories for a main
export const getSubCategories = (main) => {
  return categoryCache.subCategories[main] || [];
};

// Function to get subsub categories for main and sub
export const getSubSubCategories = (main, sub) => {
  const key = `${main}|${sub}`;
  return categoryCache.subSubCategories[key] || [];
};