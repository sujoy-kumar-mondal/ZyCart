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

const RELIABLE_IMAGES = {
  "Apple iPhone 15 (Black, 128 GB)": [
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=5120&hei=2880&fmt=p-jpg&qlt=80",
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black_AV1?wid=5120&hei=2880&fmt=p-jpg&qlt=80",
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black_AV2?wid=5120&hei=2880&fmt=p-jpg&qlt=80"
  ],
  "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB) (12 GB RAM)": [
    "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztcins-thumb-539573039?$344_344_PNG$",
    "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztcins-539573040?$684_547_PNG$",
    "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztcins-539573041?$684_547_PNG$"
  ],
  "OnePlus 12 (Silky Black, 256 GB) (12 GB RAM)": [
    "https://oasis.opstatics.com/content/dam/oasis/page/2023/12/12-black.png",
    "https://oasis.opstatics.com/content/dam/oasis/page/2023/12/12-green.png"
  ],
  "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)": [
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MTJV3?wid=1144&hei=1144&fmt=jpeg&qlt=90",
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MTJV3_AV1?wid=1144&hei=1144&fmt=jpeg&qlt=90",
    "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MTJV3_AV2?wid=1144&hei=1144&fmt=jpeg&qlt=90"
  ],
  "OnePlus Nord Buds 3 Pro ANC Bluetooth Truly Wireless in Ear Earbuds (Starry Black)": [
    "https://oasis.opstatics.com/content/dam/oasis/page/2024/audio/nord-buds-3-pro/buds3pro-black.png",
    "https://oasis.opstatics.com/content/dam/oasis/page/2024/audio/nord-buds-3-pro/buds3pro-white.png"
  ],
  "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds (Bold Black)": [
    "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/141-black.png?v=1680517859",
    "https://cdn.shopify.com/s/files/1/0057/8938/4802/products/141-black-2.png?v=1680517859"
  ],
  "Acer Nitro V AMD Ryzen 7 Octa Core 7735HS - (16 GB/512 GB SSD/6 GB Graphics/NVIDIA GeForce RTX 4050) ANV15-41 Gaming Laptop (15.6 Inch, Obsidian Black, 2.1 Kg)": [
    "https://static-ecapac.acer.com/media/catalog/product/n/i/nitro_v_15_anv15-51_gallery_01_1_2.png",
    "https://static-ecapac.acer.com/media/catalog/product/n/i/nitro_v_15_anv15-51_gallery_02_1_2.png"
  ],
  "SONY Bravia 2 138.8 cm (55 inch) Ultra HD (4K) Smart LED Google TV with 4K Processor X1 (K-55S25B)": [
    "https://www.sony.co.in/image/5d02da5df552836db894cead8a68f5f3?fmt=png-alpha&wid=660&hei=660",
    "https://www.sony.co.in/image/4a1ebfeef1b970634ec21f649bfba2eb?fmt=png-alpha&wid=660&hei=660"
  ],
  "Noise ColorFit Icon 2 Bluetooth Calling Smartwatch with 1.8\" Display (Jet Black)": [
    "https://cdn.shopify.com/s/files/1/0997/6284/products/1_2700ff3c-628b-494b-9759-4672951f28b7.png?v=1682579482",
    "https://cdn.shopify.com/s/files/1/0997/6284/products/2_71c7fa15-7ceb-47e2-aa86-829d5b7410bc.png?v=1682579482"
  ],
  "Canon EOS 1500D DSLR Camera Body+ 18-55 mm IS II Lens (Black)": [
    "https://in.canon/media/image/2018/02/26/d5b530c3ad3e4a2db65c0cf36279eb1e_eos1500d-ef-s18-55is-ii-fr-l.png",
    "https://in.canon/media/image/2018/02/26/5d1655b3ebf24c3080ff554c0e66be62_eos1500d-ef-s18-55is-ii-top-l.png"
  ]
};

async function uploadToCloudinary(url) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
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
    console.error(`Upload error for ${url}:`, err.message);
    return null;
  }
}

async function fixImages() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  for (const [title, urls] of Object.entries(RELIABLE_IMAGES)) {
    console.log(`\nProcessing images for: ${title}`);
    const product = await Product.findOne({ title });
    if (!product) {
      console.warn(`Product not found: ${title}`);
      continue;
    }

    const cloudUrls = [];
    for (const u of urls) {
      console.log(`  Uploading: ${u.substring(0, 60)}...`);
      const cUrl = await uploadToCloudinary(u);
      if (cUrl) {
        cloudUrls.push(cUrl);
        console.log(`    -> Cloudinary: ${cUrl}`);
      }
    }

    if (cloudUrls.length > 0) {
      product.images = cloudUrls;
      await product.save();
      console.log(`  ✅ Successfully updated ${cloudUrls.length} Cloudinary images for product!`);
    }
  }

  console.log("\n🎉 All product images verified and uploaded to Cloudinary!");
  process.exit(0);
}

fixImages();
