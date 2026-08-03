import AttributeSchema from "../models/AttributeSchema.js";

// ============================================================
// GET All Categories (main, sub, subsub with their schemas)
// ============================================================
export const getAllCategories = async (req, res) => {
  try {
    const schemas = await AttributeSchema.find({ isActive: true })
      .select("mainCategory subCategory subSubCategory")
      .sort({ mainCategory: 1, subCategory: 1, subSubCategory: 1 });

    // Group by main -> sub -> subsub
    const grouped = {};

    schemas.forEach((schema) => {
      if (!grouped[schema.mainCategory]) {
        grouped[schema.mainCategory] = {};
      }
      if (!grouped[schema.mainCategory][schema.subCategory]) {
        grouped[schema.mainCategory][schema.subCategory] = [];
      }
      grouped[schema.mainCategory][schema.subCategory].push(
        schema.subSubCategory
      );
    });

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// ============================================================
// GET Sub-Categories for a Main Category
// ============================================================
export const getSubCategories = async (req, res) => {
  try {
    const { mainCategory } = req.params;

    const schemas = await AttributeSchema.find({
      isActive: true,
      mainCategory: mainCategory,
    })
      .select("subCategory")
      .distinct("subCategory");

    res.json({
      success: true,
      data: schemas,
    });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-categories",
      error: error.message,
    });
  }
};

// ============================================================
// GET Sub-Sub-Categories for a Sub-Category
// ============================================================
export const getSubSubCategories = async (req, res) => {
  try {
    const { mainCategory, subCategory } = req.params;

    const schemas = await AttributeSchema.find({
      isActive: true,
      mainCategory: mainCategory,
      subCategory: subCategory,
    })
      .select("subSubCategory")
      .distinct("subSubCategory");

    res.json({
      success: true,
      data: schemas,
    });
  } catch (error) {
    console.error("Error fetching sub-sub-categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-sub-categories",
      error: error.message,
    });
  }
};

// ============================================================
// GET Attribute Schema for a Sub-Sub-Category
// This returns the form fields to display
// ============================================================
export const getAttributeSchema = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const schema = await AttributeSchema.findOne({
      isActive: true,
      mainCategory: mainCategory,
      subCategory: subCategory,
      subSubCategory: subSubCategory,
    });

    if (!schema) {
      return res.status(404).json({
        success: false,
        message: "Attribute schema not found",
      });
    }

    // Return fields sorted by display order
    const sortedFields = schema.fields.sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    res.json({
      success: true,
      data: {
        mainCategory: schema.mainCategory,
        subCategory: schema.subCategory,
        subSubCategory: schema.subSubCategory,
        fields: sortedFields,
        version: schema.version,
      },
    });
  } catch (error) {
    console.error("Error fetching attribute schema:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attribute schema",
      error: error.message,
    });
  }
};

// ============================================================
// GET Filterable Fields for a Category
// Used for advanced filtering/search
// ============================================================
export const getFilterableFields = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const schema = await AttributeSchema.findOne({
      isActive: true,
      mainCategory: mainCategory,
      subCategory: subCategory,
      subSubCategory: subSubCategory,
    });

    if (!schema) {
      return res.status(404).json({
        success: false,
        message: "Attribute schema not found",
      });
    }

    // Filter only filterable fields
    const filterableFields = schema.fields
      .filter((field) => field.filterable === true)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((field) => ({
        fieldName: field.fieldName,
        dataType: field.dataType,
        options: field.options,
      }));

    res.json({
      success: true,
      data: filterableFields,
    });
  } catch (error) {
    console.error("Error fetching filterable fields:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filterable fields",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN: Create/Update Attribute Schema
// ============================================================
export const createAttributeSchema = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory, fields, notes } =
      req.body;

    // Validation
    if (!mainCategory || !subCategory || !subSubCategory || !fields) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if schema already exists
    const existingSchema = await AttributeSchema.findOne({
      mainCategory,
      subCategory,
      subSubCategory,
    });

    if (existingSchema) {
      return res.status(400).json({
        success: false,
        message: "Schema already exists for this category. Use update instead.",
      });
    }

    // Create new schema
    const newSchema = new AttributeSchema({
      mainCategory,
      subCategory,
      subSubCategory,
      fields: fields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      notes,
    });

    await newSchema.save();

    res.status(201).json({
      success: true,
      message: "Attribute schema created successfully",
      data: newSchema,
    });
  } catch (error) {
    console.error("Error creating attribute schema:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create attribute schema",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN: Update Attribute Schema
// ============================================================
export const updateAttributeSchema = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;
    const { fields, notes } = req.body;

    const schema = await AttributeSchema.findOneAndUpdate(
      {
        mainCategory,
        subCategory,
        subSubCategory,
      },
      {
        fields: fields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        notes,
        version: { $inc: 1 }, // Increment version
      },
      { new: true }
    );

    if (!schema) {
      return res.status(404).json({
        success: false,
        message: "Attribute schema not found",
      });
    }

    res.json({
      success: true,
      message: "Attribute schema updated successfully",
      data: schema,
    });
  } catch (error) {
    console.error("Error updating attribute schema:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update attribute schema",
      error: error.message,
    });
  }
};

// ============================================================
// ADMIN: Delete Attribute Schema
// ============================================================
export const deleteAttributeSchema = async (req, res) => {
  try {
    const { mainCategory, subCategory, subSubCategory } = req.params;

    const schema = await AttributeSchema.findOneAndDelete({
      mainCategory,
      subCategory,
      subSubCategory,
    });

    if (!schema) {
      return res.status(404).json({
        success: false,
        message: "Attribute schema not found",
      });
    }

    res.json({
      success: true,
      message: "Attribute schema deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attribute schema:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete attribute schema",
      error: error.message,
    });
  }
};
