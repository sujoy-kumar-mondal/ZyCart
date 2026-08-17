import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zycart";

const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  discount: Number,
  discountedPrice: Number,
  discountPeriod: Date,
}, { strict: false });

const Product = mongoose.model("Product", productSchema);

async function checkProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Mongo");
    const products = await Product.find({}).select("title price discount discountedPrice discountPeriod");
    console.log("Found products:\n", JSON.stringify(products, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

checkProducts();
