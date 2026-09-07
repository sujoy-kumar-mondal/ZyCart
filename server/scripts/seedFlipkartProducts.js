import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import CategoryAttribute from "../models/CategoryAttribute.js";

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

const FLIPKART_PRODUCTS = [
  // -------------------------------------------------------------
  // 1. LAPTOPS
  // -------------------------------------------------------------
  {
    title: "Apple MacBook AIR M2 - (8 GB/256 GB SSD/Mac OS Monterey) MLY33HN/A (13.6 Inch, Midnight, 1.24 Kg)",
    description: "Strikingly thin and fast Apple MacBook Air powered by the next-generation M2 chip. Features a gorgeous 13.6-inch Liquid Retina display, 1080p FaceTime HD camera, four-speaker sound system with Spatial Audio, MagSafe 3 charging port, and up to 18 hours of all-day battery life.",
    price: 119900,
    discount: 25,
    discountedPrice: 89900,
    stock: 25,
    mainCategory: "Electronics",
    subCategory: "Computers",
    subSubCategory: "Laptops",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/f/j/g/-enriched-transparent-original-imahfthtkkzyazkf.png?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/t/8/i/-original-imahfyystgqdzxgz.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/w/o/9/-original-imahfyyskvad3vpk.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Apple",
      "Model Name": "MacBook Air M2 (MLY33HN/A)",
      "Color": "Midnight",
      "Type": "Thin and Light Laptop",
      "Processor Brand": "Apple",
      "Processor Name": "Apple M2",
      "Processor Generation": "14th Gen",
      "RAM Capacity": "8GB",
      "RAM Type": "Unified Memory",
      "SSD Capacity": "256GB",
      "Graphic Processor Brand": "Apple",
      "Graphic Processor Series": "Apple 8-core GPU",
      "Dedicated Graphic Memory": "Integrated",
      "Operating System": "macOS Monterey",
      "Touchscreen": "No",
      "Screen Size": "13.6 inch",
      "Screen Resolution": "Liquid Retina (2560 x 1664)",
      "Backlit Keyboard": "Yes",
      "Fingerprint Sensor": "Yes (Touch ID)",
      "Weight": "1.0 kg - 1.5 kg",
      "Battery Information": "Integrated 52.6-watt-hour lithium-polymer battery, up to 18 hours",
      "Warranty Summary": "1 Year Limited Warranty & 90 Days Complimentary Technical Support",
      "In The Box": "MacBook Air, 30W USB-C Power Adapter, USB-C to MagSafe 3 Cable (2 m)"
    }
  },
  {
    title: "ASUS Vivobook 15 Intel Core i5 12th Gen 1235U - (8 GB/512 GB SSD/Windows 11 Home) X1504ZA-NJ521WS Thin and Light Laptop (15.6 Inch, Quiet Blue, 1.70 Kg, With MS Office)",
    description: "ASUS Vivobook 15 is your everyday companion that's always ready to make light work of your agenda, whether it's office or personal, presentations or play. Powered by a 12th Gen Intel Core i5 processor, 512GB fast NVMe SSD, crisp 15.6-inch Full HD display, 180-degree lay-flat hinge, and webcam privacy shield.",
    price: 69990,
    discount: 31,
    discountedPrice: 48256,
    stock: 35,
    mainCategory: "Electronics",
    subCategory: "Computers",
    subSubCategory: "Laptops",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/l/y/8/-enriched-transparent-original-imahg53x72vqbvwg.png?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/j/i/b/-original-imahg53xythja8qg.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/i/c/q/-original-imahg53xyzfqwxe7.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Asus",
      "Model Name": "Vivobook 15 X1504ZA-NJ521WS",
      "Color": "Blue",
      "Type": "Thin and Light Laptop",
      "Processor Brand": "Intel",
      "Processor Name": "Core i5",
      "Processor Generation": "12th Gen",
      "RAM Capacity": "8GB",
      "RAM Type": "DDR4",
      "SSD Capacity": "512GB",
      "Graphic Processor Brand": "Intel",
      "Graphic Processor Series": "Intel Iris Xe Graphics",
      "Dedicated Graphic Memory": "Integrated",
      "Operating System": "Windows 11 Home",
      "Touchscreen": "No",
      "Screen Size": "15.6 inch",
      "Screen Resolution": "Full HD (1920 x 1080)",
      "Backlit Keyboard": "Yes",
      "Fingerprint Sensor": "Yes",
      "Weight": "1.5 kg - 2.0 kg",
      "Battery Information": "3-cell Li-ion, 42WHrs",
      "Warranty Summary": "1 Year Onsite Warranty",
      "In The Box": "Laptop, Power Adaptor, User Manual, Warranty Card"
    }
  },
  {
    title: "HP 14 AI PC Intel Core Ultra 7 155H - (16 GB/512 GB SSD/Windows 11 Home) 14-ep1151TU Thin and Light Laptop (14 Inch, Natural Silver, 1.4 Kg, With MS Office)",
    description: "Next-gen AI-powered HP 14 Thin and Light Laptop equipped with Intel Core Ultra 7 155H processor with built-in Intel AI Boost NPU, 16GB high-speed DDR5 RAM, vibrant 14-inch Full HD anti-glare display, backlit keyboard, HP True Vision 1080p FHD camera with privacy shutter, and HP Fast Charge support.",
    price: 98990,
    discount: 18,
    discountedPrice: 81143,
    stock: 20,
    mainCategory: "Electronics",
    subCategory: "Computers",
    subSubCategory: "Laptops",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/o/9/k/-original-imahgry8nwkejmae.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/k/o/k/-original-imahgry8sf7fa5zg.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/computer/j/y/d/-original-imahgry8zhzxgttx.jpeg?q=90"
    ],
    attributes: {
      "Brand": "HP",
      "Model Name": "14-ep1151TU",
      "Color": "Silver",
      "Type": "Thin and Light Laptop",
      "Processor Brand": "Intel",
      "Processor Name": "Intel Core Ultra 7",
      "Processor Generation": "14th Gen",
      "RAM Capacity": "16GB",
      "RAM Type": "DDR5",
      "SSD Capacity": "512GB",
      "Graphic Processor Brand": "Intel",
      "Graphic Processor Series": "Intel Arc Graphics",
      "Dedicated Graphic Memory": "Integrated",
      "Operating System": "Windows 11 Home",
      "Touchscreen": "No",
      "Screen Size": "14 inch",
      "Screen Resolution": "Full HD (1920 x 1080)",
      "Backlit Keyboard": "Yes",
      "Fingerprint Sensor": "No",
      "Weight": "1.0 kg - 1.5 kg",
      "Battery Information": "3-cell, 41 Wh Li-ion polymer",
      "Warranty Summary": "1 Year Onsite Warranty",
      "In The Box": "Laptop, Power Adapter, User Manual"
    }
  },

  // -------------------------------------------------------------
  // 2. WATCHES / SMARTWATCHES
  // -------------------------------------------------------------
  {
    title: "Apple Watch SE 3 (2025) GPS 40mm Starlight Aluminium Case with Starlight Sport Band - S/M",
    description: "Apple Watch SE delivers essential connectivity, fitness tracking, health notifications, and safety tools like Crash Detection and Fall Detection. Powered by S8 SiP 64-bit dual-core processor, bright Retina display up to 1000 nits, water resistance up to 50m, and all-day battery life.",
    price: 25900,
    discount: 7,
    discountedPrice: 23999,
    stock: 40,
    mainCategory: "Electronics",
    subCategory: "Wearable Smart Devices",
    subSubCategory: "Smart Watches",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/q/6/g/-original-imahftggbrhpfrha.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/i/3/i/-original-imahftggeby5wfup.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/6/q/u/-original-imahftghvh6vgw6d.jpeg?q=90"
    ],
    attributes: {
      "Type": "Smartwatch",
      "Brand": "Apple",
      "Model Name": "Apple Watch SE 3 (2025) GPS",
      "Compatible OS": ["iOS"],
      "Dial Shape": "Rectangle",
      "Strap Material": "Silicone",
      "Display Type": "OLED",
      "Calling Function": "Yes (Bluetooth Calling)",
      "Touchscreen": "Yes",
      "Color": "Starlight",
      "Warranty Summary": "1 Year Apple Manufacturer Warranty",
      "In The Box": "Apple Watch Case, Sport Band, Magnetic Fast Charger to USB-C Cable (1m)"
    }
  },
  {
    title: "Samsung Galaxy Watch6 Bluetooth (Graphite Strap, 44mm)",
    description: "Samsung Galaxy Watch6 features a 20% larger screen with a 30% slimmer rotating bezel, ultra-durable Sapphire Crystal glass display, advanced BIA sensor for body composition analysis, personalized sleep coaching, heart rate zone training, and seamless Galaxy ecosystem integration.",
    price: 36990,
    discount: 5,
    discountedPrice: 34999,
    stock: 30,
    mainCategory: "Electronics",
    subCategory: "Wearable Smart Devices",
    subSubCategory: "Smart Watches",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/3/r/i/-original-imahcn9fykcjjhqs.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/l/x/c/-original-imahcn9fx6dzheug.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/smartwatch/i/v/l/-original-imahcn9fjhzxsqgu.jpeg?q=90"
    ],
    attributes: {
      "Type": "Smartwatch",
      "Brand": "Samsung",
      "Model Name": "Galaxy Watch6 44mm BT",
      "Compatible OS": ["Android"],
      "Dial Shape": "Round",
      "Strap Material": "Silicone",
      "Display Type": "AMOLED",
      "Calling Function": "Yes (Bluetooth Calling)",
      "Touchscreen": "Yes",
      "Color": "Black",
      "Warranty Summary": "1 Year Comprehensive Warranty from Samsung",
      "In The Box": "Galaxy Watch6, Fast Wireless Charger, Quick Start Guide"
    }
  },
  {
    title: "Titan Workwear Black Dial Silver Stainless Steel Strap Analog Watch - For Men NN1639SM02",
    description: "Classic and sophisticated Titan Workwear analog watch crafted for everyday professional elegance. Highlights a sleek sunray black dial with contrast metallic hour indices, high-grade stainless steel link bracelet, reliable Japanese quartz movement, and 30m water resistance.",
    price: 2495,
    discount: 20,
    discountedPrice: 1995,
    stock: 50,
    mainCategory: "Fashion",
    subCategory: "Watches",
    subSubCategory: "Wrist Watches",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/watch/q/x/v/-watermarked-original-imahfszabx7ttfgx.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/watch/z/r/r/-original-imahfszazz7e6jgv.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/watch/o/3/s/-original-imahfsz988egh4zf.jpeg?q=90"
    ],
    attributes: {
      "Display Type": "Analog",
      "Ideal For": ["Men"],
      "Brand": "Titan",
      "Watch Type": "Formal",
      "Movement": "Quartz (Battery)",
      "Strap Material": "Stainless Steel",
      "Strap Color": "Silver",
      "Dial Shape": "Round",
      "Dial Color": "Black",
      "Water Resistance": "30m (3 ATM)",
      "Warranty Summary": "2 Years Manufacturer Warranty on Movement, 1 Year on Battery",
      "In The Box": "Titan Watch, Warranty Card, Presentation Box"
    }
  },

  // -------------------------------------------------------------
  // 3. ELECTRONIC GADGETS (HEADPHONES, SPEAKERS, TABLETS)
  // -------------------------------------------------------------
  {
    title: "SONY WH-1000XM5 Wireless Active Noise Cancelling Over-Ear Headphones with 30 Hours Battery Life (Black)",
    description: "Industry-leading noise cancellation powered by two processors and eight microphones for unprecedented noise-canceling performance. Features Auto NC Optimizer, crystal-clear hands-free calling with AI-based Precise Voice Pickup technology, 30mm carbon fiber composite driver units, soft-fit leather, multipoint pairing, and up to 30 hours of battery life.",
    price: 34990,
    discount: 18,
    discountedPrice: 28499,
    stock: 25,
    mainCategory: "Electronics",
    subCategory: "Audio & Video",
    subSubCategory: "Headset",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/v/d/g/-original-imahgr295uvptwq7.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/w/q/w/-original-imahgr296huaxwty.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/headphone/m/9/r/-original-imahgr29snkwgqqn.jpeg?q=90"
    ],
    attributes: {
      "Type": "Over the Ear (Headphone)",
      "Brand": "Sony",
      "Model Name": "WH-1000XM5",
      "Connectivity": "Bluetooth (Wireless)",
      "Microphone": "Yes",
      "Active Noise Cancellation (ANC)": "Yes",
      "Color": "Black",
      "Warranty Summary": "1 Year Manufacturer Warranty",
      "In The Box": "Headphones, Collapsible Carrying Case, 1.2m Headphone Cable, USB-C Charging Cable"
    }
  },
  {
    title: "JBL Flip 6 Portable 30W Bluetooth Speaker with IP67 Waterproof Rating & 12 Hours Playtime (Black)",
    description: "Experience bold JBL Original Pro Sound with the JBL Flip 6. Featuring an innovative 2-way speaker system designed to deliver loud, crystal-clear, powerful sound with deep bass. Engineered with IP67 waterproof and dustproof protection, 12 hours of playtime, PartyBoost pairing, and JBL Portable app EQ customization.",
    price: 13999,
    discount: 37,
    discountedPrice: 8799,
    stock: 45,
    mainCategory: "Electronics",
    subCategory: "Audio & Video",
    subSubCategory: "Speakers",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/speaker/d/0/v/-enriched-transparent-original-imahdxtpeqszray4.png?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/speaker/u/m/j/-original-imahdxtpqgxsccr8.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/speaker/y/w/3/-original-imahdxtpuznhzuej.jpeg?q=90"
    ],
    attributes: {
      "Type": "Portable Bluetooth Speaker",
      "Brand": "JBL",
      "Model Name": "Flip 6",
      "Configuration": "2.0 Channel",
      "Power Output (RMS)": "20 W - 40 W",
      "Connectivity": ["Bluetooth"],
      "Power Source": "Battery",
      "Color": "Black",
      "Warranty Summary": "1 Year Manufacturer Warranty",
      "In The Box": "1 x JBL Flip 6, 1 x Type C USB Cable, 1 x Quick Start Guide, 1 x Safety Sheet"
    }
  },
  {
    title: "Apple iPad (10th Gen) 256 GB ROM 10.9 inch with Wi-Fi+5G (Pink)",
    description: "Colorfully re-imagined and more versatile than ever with an all-screen design featuring a stunning 10.9-inch Liquid Retina display with True Tone. Powered by the high-performance A14 Bionic chip, ultra-fast Wi-Fi 6 and 5G cellular connectivity, Landscape 12MP Ultra Wide front camera with Center Stage, 12MP back camera, and support for Apple Pencil.",
    price: 64900,
    discount: 2,
    discountedPrice: 63499,
    stock: 20,
    mainCategory: "Electronics",
    subCategory: "Mobiles & Accessories",
    subSubCategory: "Tablets",
    rawImages: [
      "https://rukminim1.flixcart.com/image/832/832/xif0q/tablet/m/z/d/-original-imagj72twxxe5rgz.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/tablet/w/p/v/-original-imagj72tg8wnjx2h.jpeg?q=90",
      "https://rukminim1.flixcart.com/image/832/832/xif0q/tablet/l/e/q/-original-imagj72t2hbnde8j.jpeg?q=90"
    ],
    attributes: {
      "Brand": "Apple",
      "Model Name": "iPad (10th Generation) Wi-Fi + Cellular",
      "Color": "Pink",
      "RAM Capacity": "4GB",
      "Internal Storage": "256GB",
      "Screen Size": 10.9,
      "Connectivity": "Wi-Fi + 5G",
      "Operating System": "iPadOS",
      "Voice Call Support": "Yes",
      "Battery Capacity": 7606,
      "Primary Camera": "12 MP Wide Camera, f/1.8 aperture",
      "Warranty Summary": "1 Year Apple Limited Warranty",
      "In The Box": "10.9-inch iPad, USB-C Charge Cable (1 meter), 20W USB-C Power Adapter"
    }
  }
];

async function seedProducts() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Find or pick approved seller
    const seller = await Seller.findOne({ isApproved: true }) || await Seller.findOne({});
    if (!seller) {
      console.error("No seller found in database! Please register a seller first.");
      process.exit(1);
    }
    console.log(`Using seller: ${seller.name} (${seller.shopName || seller.email}) ID: ${seller._id}`);

    for (let i = 0; i < FLIPKART_PRODUCTS.length; i++) {
      const p = FLIPKART_PRODUCTS[i];
      console.log(`\n[${i + 1}/${FLIPKART_PRODUCTS.length}] Processing "${p.title}"...`);

      // Upload images to Cloudinary
      const uploadedImages = [];
      for (const imgUrl of p.rawImages) {
        console.log(`  Uploading image: ${imgUrl.substring(0, 70)}...`);
        const cUrl = await uploadImageFromUrl(imgUrl);
        uploadedImages.push(cUrl);
      }

      // Check if product with same title already exists
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

    console.log("\n🎉 All 9 genuine Flipkart products successfully seeded into ZyCart!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedProducts();
