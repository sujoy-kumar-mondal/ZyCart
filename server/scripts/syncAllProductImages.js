import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRODUCT_IMAGE_SOURCES = {
  "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB) (12 GB RAM)": [
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=85"
  ],
  "OnePlus 12 (Silky Black, 256 GB) (12 GB RAM)": [
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=85"
  ],
  "OnePlus Nord Buds 3 Pro ANC Bluetooth Truly Wireless in Ear Earbuds (Starry Black)": [
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1200&q=85"
  ],
  "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds (Bold Black)": [
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1200&q=85"
  ],
  "SONY Bravia 2 138.8 cm (55 inch) Ultra HD (4K) Smart LED Google TV with 4K Processor X1 (K-55S25B)": [
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=85"
  ],
  "Noise ColorFit Icon 2 Bluetooth Calling Smartwatch with 1.8\" Display (Jet Black)": [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85"
  ],
  "Canon EOS 1500D DSLR Camera Body+ 18-55 mm IS II Lens (Black)": [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=85"
  ]
};

async function uploadToCloudinary(url) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products", resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(res.data);
    });
  } catch (err) {
    console.error(`Error uploading from ${url}:`, err.message);
    return null;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  for (const [title, urls] of Object.entries(PRODUCT_IMAGE_SOURCES)) {
    console.log(`\nProcessing: ${title}`);
    const product = await Product.findOne({ title });
    if (!product) {
      console.warn(`Product not found: ${title}`);
      continue;
    }

    const cloudUrls = [];
    for (const u of urls) {
      console.log(`  Downloading & uploading: ${u.substring(0, 70)}...`);
      const cUrl = await uploadToCloudinary(u);
      if (cUrl) {
        cloudUrls.push(cUrl);
        console.log(`    -> Uploaded to Cloudinary: ${cUrl}`);
      }
    }

    if (cloudUrls.length > 0) {
      product.images = cloudUrls;
      await product.save();
      console.log(`  ✅ Successfully updated ${cloudUrls.length} images on product!`);
    }
  }

  console.log("\n🎉 All product images successfully uploaded to Cloudinary!");
  process.exit(0);
}

run();
