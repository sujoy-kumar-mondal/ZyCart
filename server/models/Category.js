import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
categorySchema.index({ mainCategory: 1, subCategory: 1, subSubCategory: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
