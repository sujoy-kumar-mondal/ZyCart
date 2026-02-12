import mongoose from "mongoose";

// Schema for a single attribute field
const attributeFieldSchema = new mongoose.Schema(
  {
    fieldName: {
      type: String,
      required: true,
    },

    // Data type: text, decimal, integer, select, multi-select
    dataType: {
      type: String,
      enum: ["Text", "Decimal", "Integer", "Select (Enum)", "Multi-Select"],
      required: true,
    },

    // Whether field is required
    required: {
      type: Boolean,
      default: false,
    },

    // Whether field is filterable in product search
    filterable: {
      type: Boolean,
      default: false,
    },

    // For Select/Multi-Select types: array of valid options
    // For Text/Integer/Decimal: validation rules (optional)
    options: {
      type: [String],
      default: [],
    },

    // For Text fields: placeholder text
    placeholder: {
      type: String,
      default: "",
    },

    // Field display order
    displayOrder: {
      type: Number,
      default: 0,
    },

    // Help text for sellers
    helpText: {
      type: String,
      default: "",
    },
  },
  { _id: false } // No need for separate ID for nested fields
);

const attributeSchemaSchema = new mongoose.Schema(
  {
    // Main Category (e.g., "Electronics")
    mainCategory: {
      type: String,
      required: true,
      index: true,
    },

    // Sub Category (e.g., "Mobile & Accessories")
    subCategory: {
      type: String,
      required: true,
      index: true,
    },

    // Sub-Sub Category (e.g., "Mobile" or "Kitchen Appliances")
    subSubCategory: {
      type: String,
      required: true,
      index: true,
    },

    // Array of attribute fields for this category
    fields: {
      type: [attributeFieldSchema],
      default: [],
      required: true,
    },

    // Active/Inactive status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Version control for schema updates
    version: {
      type: Number,
      default: 1,
    },

    // Notes about this schema
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for quick lookups
attributeSchemaSchema.index({
  mainCategory: 1,
  subCategory: 1,
  subSubCategory: 1,
  isActive: 1,
});

const AttributeSchema = mongoose.model("AttributeSchema", attributeSchemaSchema);
export default AttributeSchema;
