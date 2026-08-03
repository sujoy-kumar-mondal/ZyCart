import CategoryAttribute from "../models/CategoryAttribute.js";

// ----------------------------------------------------------
// GET ATTRIBUTES FOR A CATEGORY
// ----------------------------------------------------------
export const getAttributesByCategory = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const categoryAttribute = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
      isActive: true,
    });

    if (!categoryAttribute) {
      return res.status(404).json({
        success: false,
        message: `No attributes found for ${subSubCategory}`,
      });
    }

    // Sort fields by displayOrder
    const sortedFields = categoryAttribute.fields.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    res.status(200).json({
      success: true,
      mainCategory,
      subCategory,
      subSubCategory,
      fieldCount: sortedFields.length,
      fields: sortedFields,
    });
  } catch (error) {
    console.error("Get attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET FILTERABLE ATTRIBUTES FOR A CATEGORY
// ----------------------------------------------------------
export const getFilterableAttributes = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const categoryAttribute = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
      isActive: true,
    });

    if (!categoryAttribute) {
      return res.status(404).json({
        success: false,
        message: `No attributes found for ${subSubCategory}`,
      });
    }

    // Filter only filterable fields and sort by displayOrder
    const filterableFields = categoryAttribute.fields
      .filter((field) => field.filterable === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.status(200).json({
      success: true,
      mainCategory,
      subCategory,
      subSubCategory,
      filterableCount: filterableFields.length,
      fields: filterableFields,
    });
  } catch (error) {
    console.error("Get filterable attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET REQUIRED ATTRIBUTES FOR A CATEGORY
// ----------------------------------------------------------
export const getRequiredAttributes = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const categoryAttribute = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
      isActive: true,
    });

    if (!categoryAttribute) {
      return res.status(404).json({
        success: false,
        message: `No attributes found for ${subSubCategory}`,
      });
    }

    // Filter only required fields and sort by displayOrder
    const requiredFields = categoryAttribute.fields
      .filter((field) => field.required === true)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.status(200).json({
      success: true,
      mainCategory,
      subCategory,
      subSubCategory,
      requiredCount: requiredFields.length,
      fields: requiredFields,
    });
  } catch (error) {
    console.error("Get required attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ALL CATEGORIES WITH ATTRIBUTES
// ----------------------------------------------------------
export const getAllCategoriesWithAttributes = async (req, res) => {
  try {
    const categories = await CategoryAttribute.find({ isActive: true });

    const grouped = {};

    categories.forEach((cat) => {
      if (!grouped[cat.mainCategory]) {
        grouped[cat.mainCategory] = {};
      }
      if (!grouped[cat.mainCategory][cat.subCategory]) {
        grouped[cat.mainCategory][cat.subCategory] = {};
      }
      grouped[cat.mainCategory][cat.subCategory][cat.subSubCategory] = {
        fieldCount: cat.fields.length,
        filterableCount: cat.fields.filter((f) => f.filterable).length,
        requiredCount: cat.fields.filter((f) => f.required).length,
      };
    });

    res.status(200).json({
      success: true,
      totalCategories: categories.length,
      data: grouped,
    });
  } catch (error) {
    console.error("Get all categories with attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// GET ATTRIBUTE STATISTICS
// ----------------------------------------------------------
export const getAttributeStats = async (req, res) => {
  try {
    const categories = await CategoryAttribute.find({ isActive: true });

    let totalFields = 0;
    let totalFilterable = 0;
    let totalRequired = 0;
    const typeStats = {};

    categories.forEach((cat) => {
      cat.fields.forEach((field) => {
        totalFields++;
        if (field.filterable) totalFilterable++;
        if (field.required) totalRequired++;

        typeStats[field.dataType] = (typeStats[field.dataType] || 0) + 1;
      });
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalCategories: categories.length,
        totalFields,
        totalFilterable,
        totalRequired,
        percentageFilterable: ((totalFilterable / totalFields) * 100).toFixed(1),
        percentageRequired: ((totalRequired / totalFields) * 100).toFixed(1),
      },
      fieldsByDataType: typeStats,
    });
  } catch (error) {
    console.error("Get attribute stats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------------------------------------
// VALIDATE PRODUCT ATTRIBUTES
// ----------------------------------------------------------
export const validateProductAttributes = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory, attributes } = req.body;

    if (!attributes || Object.keys(attributes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attributes object is required",
      });
    }

    const categoryAttribute = await CategoryAttribute.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
      isActive: true,
    });

    if (!categoryAttribute) {
      return res.status(404).json({
        success: false,
        message: `No attribute schema found for ${subSubCategory}`,
      });
    }

    const errors = [];
    const validatedAttributes = {};

    // Check each field in the schema
    categoryAttribute.fields.forEach((field) => {
      const providedValue = attributes[field.fieldName];

      // Check required fields
      if (field.required && (!providedValue || providedValue === "")) {
        errors.push(`${field.fieldName} is required`);
        return;
      }

      // If provided, validate based on data type
      if (providedValue !== undefined && providedValue !== "") {
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
          if (!field.options.includes(providedValue)) {
            errors.push(
              `${field.fieldName} must be one of: ${field.options.join(", ")}`
            );
            return;
          }
          validatedAttributes[field.fieldName] = providedValue;
        } else if (field.dataType === "Multi-Select") {
          const values = Array.isArray(providedValue)
            ? providedValue
            : [providedValue];
          const invalidValues = values.filter((v) => !field.options.includes(v));
          if (invalidValues.length > 0) {
            errors.push(
              `${field.fieldName} contains invalid values: ${invalidValues.join(", ")}`
            );
            return;
          }
          validatedAttributes[field.fieldName] = values;
        } else {
          // Text field
          validatedAttributes[field.fieldName] = String(providedValue).trim();
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(200).json({
      success: true,
      message: "Attributes validated successfully",
      validatedAttributes,
    });
  } catch (error) {
    console.error("Validate attributes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
