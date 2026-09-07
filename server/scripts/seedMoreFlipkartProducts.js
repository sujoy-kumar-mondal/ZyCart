import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageFromUrl(imageUrl, folder = "products") {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.flipkart.com/",
      },
      timeout: 15000,
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }
      );
      stream.end(response.data);
    });
  } catch (err) {
    console.warn(`Could not upload ${imageUrl} to Cloudinary, falling back to direct URL. (${err.message})`);
    return imageUrl;
  }
}

const NEW_FLIPKART_PRODUCTS = [
  // -------------------------------------------------------------
  // 1. SMARTPHONES
  // -------------------------------------------------------------
  {
    title: "Apple iPhone 15 (Black, 128 GB)",
    description: "iPhone 15 brings you Dynamic Island, a 48MP Main camera with 2x Telephoto, and USB-C — all in a durable color-infused glass and aluminum design. Powered by the super-fast A16 Bionic chip, all-day battery life, and Ceramic Shield front that is tougher than any smartphone glass.",
    price: 69900,
    discount: 17,
    discountedPrice: 57999,
    stock: 40,
    mainCategory: "Electronics",
    subCategory: "Mobiles & Accessories",
    subSubCategory: "Mobiles",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/h/d/9/-original-imagtc2fz9spmhgv.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/a/c/k/-original-imagtc2fdt7gwhjg.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/e/l/y/-original-imagtc2f25wzuhg7.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Apple",
      "Model Name": "iPhone 15",
      "Color": "Black",
      "RAM Capacity": "6GB",
      "Internal Storage": "128GB",
      "Screen Size": 6.1,
      "Network Type": ["5G", "4G VoLTE"],
      "Operating System": "iOS",
      "Primary Camera": "48MP + 12MP",
      "Secondary Camera": "12MP TrueDepth Camera",
      "Battery Capacity": 3349,
      "Processor Brand": "Apple A-Series",
      "SIM Type": "Dual SIM",
      "Warranty Summary": "1 Year Warranty for Phone and 6 Months for In-Box Accessories",
      "In The Box": "iPhone, USB-C Charge Cable, Documentation"
    }
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB) (12 GB RAM)",
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display with Corning Gorilla Armor. Unleash whole new levels of creativity, productivity and possibility with built-in Galaxy AI, 200MP camera system with 100x Space Zoom, and built-in S Pen.",
    price: 134999,
    discount: 11,
    discountedPrice: 119999,
    stock: 25,
    mainCategory: "Electronics",
    subCategory: "Mobiles & Accessories",
    subSubCategory: "Mobiles",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/5/t/j/-original-imagx9eg4eghzczn.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/u/c/s/-original-imagx9eg4fwhvczb.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/i/e/r/-original-imagx9egzgfvazh7.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Samsung",
      "Model Name": "Galaxy S24 Ultra 5G",
      "Color": "Grey",
      "RAM Capacity": "12GB",
      "Internal Storage": "256GB",
      "Screen Size": 6.8,
      "Network Type": ["5G", "4G VoLTE"],
      "Operating System": "Android",
      "Primary Camera": "200MP + 50MP + 12MP + 10MP",
      "Secondary Camera": "12MP Front Camera",
      "Battery Capacity": 5000,
      "Processor Brand": "Qualcomm Snapdragon",
      "SIM Type": "Dual SIM",
      "Warranty Summary": "1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories",
      "In The Box": "Handset, Data Cable (Type C to Type C), Ejection Pin, S-Pen, Quick Start Guide"
    }
  },
  {
    title: "OnePlus 12 (Silky Black, 256 GB) (12 GB RAM)",
    description: "The OnePlus 12 delivers flagship-defining performance with Qualcomm Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System for Mobile, 2K 120Hz ProXDR Display with 4500 nits peak brightness, 100W SUPERVOOC fast wired charging, 50W AIRVOOC wireless charging, and large 5400 mAh battery.",
    price: 64999,
    discount: 12,
    discountedPrice: 56999,
    stock: 30,
    mainCategory: "Electronics",
    subCategory: "Mobiles & Accessories",
    subSubCategory: "Mobiles",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/y/t/p/-original-imagx8fnjhgtgkhz.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/mobile/8/2/q/-original-imagx8fnd54xhnz7.jpeg?q=90"
    ],
    attributes: {
      "Brand": "OnePlus",
      "Model Name": "OnePlus 12",
      "Color": "Black",
      "RAM Capacity": "12GB",
      "Internal Storage": "256GB",
      "Screen Size": 6.82,
      "Network Type": ["5G", "4G VoLTE"],
      "Operating System": "Android",
      "Primary Camera": "50MP + 64MP + 48MP",
      "Secondary Camera": "32MP Front Camera",
      "Battery Capacity": 5400,
      "Processor Brand": "Qualcomm Snapdragon",
      "SIM Type": "Dual SIM",
      "Warranty Summary": "1 Year Manufacturer Warranty for Phone and 6 Months for In-Box Accessories",
      "In The Box": "OnePlus 12, 100W SUPERVOOC Power Adapter, Type-C Cable, Quick Start Guide, Welcome Letter, Safety Information, SIM Tray Ejector"
    }
  },

  // -------------------------------------------------------------
  // 2. WIRELESS AUDIO & EARBUDS (HEADSET)
  // -------------------------------------------------------------
  {
    title: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    description: "AirPods Pro (2nd Gen) with MagSafe Charging Case (USB-C) deliver up to 2x more Active Noise Cancellation than the previous generation. Adaptive Audio dynamically blends Transparency mode and Active Noise Cancellation. Personalized Spatial Audio with dynamic head tracking places sound all around you.",
    price: 24900,
    discount: 16,
    discountedPrice: 20999,
    stock: 50,
    mainCategory: "Electronics",
    subCategory: "Audio & Video",
    subSubCategory: "Headset",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/p/r/z/-original-imagu94wf5k9zrgf.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/d/x/9/-original-imagu94weftzzvh5.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/0/x/h/-original-imagu94whk6kdf6z.jpeg?q=90"
    ],
    attributes: {
      "Type": "True Wireless (TWS)",
      "Brand": "Apple",
      "Model Name": "AirPods Pro (2nd Gen) USB-C",
      "Connectivity": "Bluetooth (Wireless)",
      "Microphone": "Yes",
      "Active Noise Cancellation (ANC)": "Yes",
      "Color": "White",
      "Warranty Summary": "1 Year Manufacturer Warranty",
      "In The Box": "AirPods Pro, MagSafe Charging Case (USB-C) with Speaker and Lanyard Loop, Silicone Ear Tips (four sizes: XS, S, M, L), USB-C Charge Cable, Documentation"
    }
  },
  {
    title: "OnePlus Nord Buds 3 Pro ANC Bluetooth Truly Wireless in Ear Earbuds (Starry Black)",
    description: "OnePlus Nord Buds 3 Pro feature Hybrid Active Noise Cancellation up to 49dB with ultra-wide 4000Hz frequency range, 12.4mm Titanized dynamic drivers with BassWave 2.0, dual mic AI clear call noise cancellation, dual device connection, and up to 44 hours of total battery life with fast charging.",
    price: 3299,
    discount: 15,
    discountedPrice: 2799,
    stock: 60,
    mainCategory: "Electronics",
    subCategory: "Audio & Video",
    subSubCategory: "Headset",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/0/o/s/-original-imah2n87z69wwhug.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/j/z/y/-original-imah2n873szp8euv.jpeg?q=90"
    ],
    attributes: {
      "Type": "True Wireless (TWS)",
      "Brand": "OnePlus",
      "Model Name": "Nord Buds 3 Pro",
      "Connectivity": "Bluetooth (Wireless)",
      "Microphone": "Yes",
      "Active Noise Cancellation (ANC)": "Yes",
      "Color": "Black",
      "Warranty Summary": "1 Year Brand Warranty",
      "In The Box": "OnePlus Nord Buds 3 Pro Earbuds, Charging Case, USB Type-C Charging Cable, Additional Silicone Ear Tips, User Manual"
    }
  },
  {
    title: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds (Bold Black)",
    description: "Enjoy an immersive listening experience with boAt Airdopes 141 true wireless earbuds. Equipped with 8mm dynamic drivers for boAt Signature Sound, ENx Environmental Noise Cancellation tech for crystal-clear voice calls, BEAST Mode 80ms low latency for gaming, and up to 42 hours of playback.",
    price: 4490,
    discount: 77,
    discountedPrice: 999,
    stock: 100,
    mainCategory: "Electronics",
    subCategory: "Audio & Video",
    subSubCategory: "Headset",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/e/a/f/-original-imagtc44nk4uwg6g.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/w/7/f/-original-imagtc44y5fkg4ez.jpeg?q=90"
    ],
    attributes: {
      "Type": "True Wireless (TWS)",
      "Brand": "Boat",
      "Model Name": "Airdopes 141",
      "Connectivity": "Bluetooth (Wireless)",
      "Microphone": "Yes",
      "Active Noise Cancellation (ANC)": "No",
      "Color": "Black",
      "Warranty Summary": "1 Year Warranty from Date of Purchase",
      "In The Box": "Airdopes 141, Extra Earbuds Tips, Type C Charging Cable, User Manual, Warranty Card"
    }
  },

  // -------------------------------------------------------------
  // 3. GAMING LAPTOP
  // -------------------------------------------------------------
  {
    title: "Acer Nitro V AMD Ryzen 7 Octa Core 7735HS - (16 GB/512 GB SSD/6 GB Graphics/NVIDIA GeForce RTX 4050) ANV15-41 Gaming Laptop (15.6 Inch, Obsidian Black, 2.1 Kg)",
    description: "Fuel your gaming passion with the Acer Nitro V 15. Powered by AMD Ryzen 7 7735HS octa-core processor and NVIDIA GeForce RTX 4050 (6GB GDDR6 VRAM) GPU, experience high frame rates on a blistering 144Hz IPS Full HD display with dual-fan cooling system and NitroSense control center.",
    price: 99999,
    discount: 28,
    discountedPrice: 71990,
    stock: 20,
    mainCategory: "Electronics",
    subCategory: "Computers",
    subSubCategory: "Laptops",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/9/u/3/-original-imah2347zhwffg9u.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/x/r/b/-original-imah2347ygfvzkug.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Acer",
      "Model Name": "Nitro V ANV15-41",
      "Color": "Black",
      "Type": "Gaming Laptop",
      "Processor Brand": "AMD",
      "Processor Name": "Ryzen 7",
      "Processor Generation": "7th Gen",
      "RAM Capacity": "16GB",
      "RAM Type": "DDR5",
      "SSD Capacity": "512GB",
      "Graphic Processor Brand": "NVIDIA",
      "Graphic Processor Series": "GeForce RTX 4050",
      "Dedicated Graphic Memory": "6GB",
      "Operating System": "Windows 11 Home",
      "Touchscreen": "No",
      "Screen Size": "15.6 inch",
      "Screen Resolution": "Full HD (1920 x 1080)",
      "Backlit Keyboard": "Yes",
      "Fingerprint Sensor": "No",
      "Weight": "2.0 kg - 2.5 kg",
      "Battery Information": "57 Wh 3-cell Li-ion battery",
      "Warranty Summary": "1 Year International Travelers Warranty (ITW)",
      "In The Box": "Laptop, Power Adapter, User Manual"
    }
  },

  // -------------------------------------------------------------
  // 4. SMART TV
  // -------------------------------------------------------------
  {
    title: "SONY Bravia 2 138.8 cm (55 inch) Ultra HD (4K) Smart LED Google TV with 4K Processor X1 (K-55S25B)",
    description: "Sony Bravia 2 55-inch 4K Smart TV delivers breathtaking clarity and vibrant colors powered by the 4K Processor X1 and Live Color technology. Enjoy cinematic 4K HDR entertainment with Google TV, Dolby Audio, Motionflow XR 100, Open Baffle Speaker, and seamless Apple AirPlay support.",
    price: 99900,
    discount: 42,
    discountedPrice: 57990,
    stock: 15,
    mainCategory: "Electronics",
    subCategory: "Home Entertainment",
    subSubCategory: "Televisions",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/television/a/g/p/-original-imah2z7g75f4tqez.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/television/u/f/6/-original-imah2z7gnzrzhgzh.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Sony",
      "Model Name": "K-55S25B",
      "Screen Size": "55 inch",
      "Screen Resolution": "Ultra HD (4K) (3840 x 2160)",
      "Screen Type": "LED",
      "Smart TV": "Yes",
      "Connectivity Features": ["Built-in Wi-Fi", "Bluetooth", "HDMI eARC", "Ethernet (LAN)"],
      "Wall Mount Included": "Yes",
      "Warranty Summary": "1 Year Comprehensive Warranty provided by Sony from date of purchase",
      "In The Box": "1 TV Unit, Voice Remote Control, Power Cord, Tabletop Stand, Wall Mount Bracket, Batteries, User Manual"
    }
  },

  // -------------------------------------------------------------
  // 5. BUDGET SMARTWATCH
  // -------------------------------------------------------------
  {
    title: "Noise ColorFit Icon 2 Bluetooth Calling Smartwatch with 1.8\" Display (Jet Black)",
    description: "Noise ColorFit Icon 2 comes equipped with a large 1.8-inch bright display, Bluetooth calling with quick dial pad and contact logs, 100+ sports modes, 100+ customizable watch faces, AI Voice Assistant, 24x7 Heart Rate & SpO2 blood oxygen tracking, and up to 7 days battery life.",
    price: 5999,
    discount: 75,
    discountedPrice: 1499,
    stock: 75,
    mainCategory: "Electronics",
    subCategory: "Wearable Smart Devices",
    subSubCategory: "Smart Watches",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/y/v/a/-original-imagg2t24vfhzhzz.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/c/t/8/-original-imagg2t2qgfvyf3e.jpeg?q=90"
    ],
    attributes: {
      "Type": "Smartwatch",
      "Brand": "Noise",
      "Model Name": "ColorFit Icon 2",
      "Compatible OS": ["Android", "iOS"],
      "Dial Shape": "Rectangle",
      "Strap Material": "Silicone",
      "Display Type": "LCD / TFT",
      "Calling Function": "Yes (Bluetooth Calling)",
      "Touchscreen": "Yes",
      "Color": "Black",
      "Warranty Summary": "1 Year Warranty on Manufacturing Defects",
      "In The Box": "Smartwatch, Magnetic Charging Cable, User Manual"
    }
  },

  // -------------------------------------------------------------
  // 6. DSLR CAMERA
  // -------------------------------------------------------------
  {
    title: "Canon EOS 1500D DSLR Camera Body+ 18-55 mm IS II Lens (Black)",
    description: "All camera users, even beginners, will be able to capture amazing images and movies with this Canon EOS 1500D DSLR camera. Featuring a 24.1-megapixel APS-C CMOS sensor, DIGIC 4+ image processor, 9-point AF system with 1 center cross-type AF point, Full HD 1080p video recording, and built-in Wi-Fi and NFC connectivity.",
    price: 47995,
    discount: 12,
    discountedPrice: 41990,
    stock: 20,
    mainCategory: "Electronics",
    subCategory: "Cameras & Accessories",
    subSubCategory: "Cameras",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/kk01pjk0/dslr-camera/f/v/o/eos-1500d-canon-original-imafzfugydh2yuhz.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/kk01pjk0/dslr-camera/h/f/r/eos-1500d-canon-original-imafzfug33zfzrhg.jpeg?q=90"
    ],
    attributes: {
      "Type": "DSLR",
      "Brand": "Canon",
      "Model Name": "EOS 1500D",
      "Effective Pixels": "24 - 36 MP",
      "Sensor Type": "CMOS",
      "Sensor Size": "APS-C",
      "Video Resolution": "Full HD (1080p)",
      "Connectivity": ["Wi-Fi", "NFC"],
      "Color": "Black",
      "Warranty Summary": "2 Years Canon India Warranty",
      "In The Box": "EOS 1500D Body, EF-S 18-55mm f/3.5-5.6 IS II Lens, Battery Pack LP-E10, Battery Charger LC-E10E, Neck Strap EW-400D, User Manual"
    }
  }
];

async function seedNewProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const seller = await Seller.findOne({ isApproved: true }) || await Seller.findOne({});
    if (!seller) {
      console.error("No seller found in database!");
      process.exit(1);
    }
    console.log(`Using seller: ${seller.name} (${seller.shopName || seller.email}) ID: ${seller._id}`);

    for (let i = 0; i < NEW_FLIPKART_PRODUCTS.length; i++) {
      const p = NEW_FLIPKART_PRODUCTS[i];
      console.log(`\n[${i + 1}/${NEW_FLIPKART_PRODUCTS.length}] Processing "${p.title}"...`);

      const uploadedImages = [];
      for (const imgUrl of p.rawImages) {
        console.log(`  Uploading image: ${imgUrl.substring(0, 70)}...`);
        const cUrl = await uploadImageFromUrl(imgUrl);
        uploadedImages.push(cUrl);
      }

      const existing = await Product.findOne({ title: p.title });
      if (existing) {
        console.log(`  Updating existing product ID: ${existing._id}`);
        existing.description = p.description;
        existing.price = p.price;
        existing.discount = p.discount;
        existing.discountedPrice = p.discountedPrice;
        existing.stock = p.stock;
        existing.images = uploadedImages;
        existing.mainCategory = p.mainCategory;
        existing.subCategory = p.subCategory;
        existing.subSubCategory = p.subSubCategory;
        existing.attributes = p.attributes;
        existing.isAvailable = true;
        await existing.save();
        console.log(`  ✅ Successfully updated!`);
      } else {
        const newProduct = await Product.create({
          title: p.title,
          description: p.description,
          price: p.price,
          discount: p.discount,
          discountedPrice: p.discountedPrice,
          stock: p.stock,
          images: uploadedImages,
          seller: seller._id,
          mainCategory: p.mainCategory,
          subCategory: p.subCategory,
          subSubCategory: p.subSubCategory,
          attributes: p.attributes,
          maxQuantityPerPurchase: 5,
          isAvailable: true,
        });
        console.log(`  ✅ Successfully created product ID: ${newProduct._id}`);
      }
    }

    console.log("\n🎉 All 10 additional genuine Flipkart products successfully seeded into ZyCart!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedNewProducts();
