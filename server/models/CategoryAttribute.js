import mongoose from "mongoose";

const attributeFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
  },
  dataType: {
    type: String,
    enum: ["Text", "Select", "Multi-Select", "Integer", "Decimal"],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  filterable: {
    type: Boolean,
    default: false,
  },
  options: [String], // For Select and Multi-Select types
  displayOrder: {
    type: Number,
    default: 0,
  },
  placeholder: String,
  helpText: String,
});

const categoryAttributeSchema = new mongoose.Schema({
  mainCategory: {
    type: String,
    required: true,
    index: true,
  },
  subCategory: {
    type: String,
    required: true,
    index: true,
  },
  subSubCategory: {
    type: String,
    required: true,
    index: true,
  },
  fields: [attributeFieldSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
categoryAttributeSchema.index({
  mainCategory: 1,
  subCategory: 1,
  subSubCategory: 1,
});

export default mongoose.model("CategoryAttribute", categoryAttributeSchema);
