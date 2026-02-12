import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Simple category hierarchy model for this script
const categorySchema = new mongoose.Schema({
  mainCategory: String,
  subCategory: String,
  subSubCategory: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", categorySchema);

const CATEGORY_HIERARCHY = [
  // ============ ELECTRONICS ============
  {
    mainCategory: "Electronics",
    subcategories: [
      {
        subCategory: "Mobiles & Accessories",
        items: ["Mobiles", "Tablets", "Mobile Accessories", "Tablet Accessories"],
      },
      {
        subCategory: "Computers",
        items: [
          "Laptops",
          "Laptop Accessories",
          "Network Components",
          "Computer Peripherals",
          "Software",
          "Computer Components",
          "Desktop PCs",
          "E-readers",
          "Storage",
          "Audio Players",
          "Video Players",
          "TV & Video Accessories",
        ],
      },
      {
        subCategory: "Cameras & Accessories",
        items: ["Cameras", "Camera Accessories"],
      },
      {
        subCategory: "Home Entertainment",
        items: [
          "Video Players & Accessories",
          "MP3 players/Ipods Accessories",
          "Audio Players",
          "Home Audio",
          "DTH",
          "Televisions",
        ],
      },
      {
        subCategory: "Audio & Video",
        items: [
          "Video Accessories",
          "Speakers",
          "Music Players & Accessories",
          "Audio Accessories",
          "Home Theaters",
          "Headset",
          "Professional Audio Systems",
        ],
      },
      {
        subCategory: "Wearable Smart Devices",
        items: [
          "Smart Watches",
          "Smart Bands",
          "Bluetooth Hats",
          "Smart Gloves",
          "Smart Glasses",
          "Smart Headphones",
          "Wearable Accessories",
          "Smart Trackers",
          "Smart Rings",
          "Smart Footwears",
          "Bluetooth Item Finders",
        ],
      },
      {
        subCategory: "Automation & Robotics",
        items: [
          "Smart Lighting",
          "Smart Assistants",
          "Multipurpose Controller",
          "Smart Switches",
          "Sensors & Alarms",
          "Smart Pens",
          "Surveillance Devices",
          "Smart Door Locks",
        ],
      },
      {
        subCategory: "Vas (Value Added Services/Digital Goods)",
        items: ["Gift Cards", "On Demand Services", "Physical Gift Voucher", "Digital"],
      },
    ],
  },

  // ============ FASHION ============
  {
    mainCategory: "Fashion",
    subcategories: [
      {
        subCategory: "Clothing and Accessories",
        items: [
          "Winter Wear",
          "Topwear",
          "Bottomwear",
          "Raincoats",
          "Dresses and Gowns",
          "Clothing Accessories",
          "Jumpsuits and Dungarees",
          "Kurtas, Ethnic Sets and Bottoms",
          "Fabrics",
          "Sarees and Saree Essentials",
          "Kids' Combos and Costumes",
          "Lehenga Cholis",
          "Windcheaters",
          "Sleepwear",
          "Innerwear and Swimwear",
          "Tracksuits",
          "Blazers, Waistcoats and Suits",
          "Co-ords",
          "Twinning Sets",
        ],
      },
      {
        subCategory: "Bags, Wallets & Belts",
        items: [
          "Bags & Backpacks",
          "Luggage & Travel",
          "Wallets & Clutches",
          "Handbags & Clutches",
          "Garment Covers",
          "Key Chains",
          "Accessories Combo",
          "Belts",
        ],
      },
      {
        subCategory: "Jewellery",
        items: [
          "Gemstones, Coins & Bars",
          "Precious Articles",
          "Artificial Jewellery",
          "Precious Jewellery",
          "Silver Jewellery",
        ],
      },
      {
        subCategory: "Eyewear",
        items: ["Reading Glasses", "Frames", "Nose Pads"],
      },
      {
        subCategory: "Watches",
        items: ["Wrist Watches", "Watch Accessories", "Weather Stations"],
      },
      {
        subCategory: "Kids Accessories",
        items: ["School Supplies"],
      },
      {
        subCategory: "Sunglasses",
        items: ["Sunglasses"],
      },
      {
        subCategory: "Footwear",
        items: ["Women's Footwear", "Kids' & Infant Footwear", "Men's Footwear"],
      },
    ],
  },

  // ============ HOME & KITCHEN ============
  {
    mainCategory: "Home & Kitchen",
    subcategories: [
      {
        subCategory: "Home Improvement",
        items: [
          "Lawn and Gardening",
          "Tools and Measuring Equipment",
          "Home Utilities and Organizers",
          "Home Safety",
        ],
      },
      {
        subCategory: "Building Materials and Supplies",
        items: [
          "Construction Tools and Equipments",
          "Wooden Supplies",
          "Bathroom and Kitchen Fittings",
          "Plumbing Supplies",
          "Building Raw Materials",
          "Solar and Alternate Energy",
          "Electrical Hardware",
          "Furniture Parts",
          "Paint Supplies and Equipment",
          "Door and Window Fittings",
          "Building Supplies Add-Ons",
        ],
      },
      {
        subCategory: "Home & Kitchen",
        items: ["Home Appliances", "Kitchen Appliances"],
      },
      {
        subCategory: "Home Lighting",
        items: ["Utility Lighting", "Decor lighting & Accessories"],
      },
      {
        subCategory: "Kitchen, Cookware & Serveware",
        items: [
          "Spray Bottle",
          "Kitchen Tools",
          "Lunch Boxes",
          "Water Bottles & Flasks",
          "Cookware",
          "Gas Stove & Accessories",
          "Bakeware",
          "Outdoor Cooking",
          "Knives, Choppers & Cutters",
          "Hand Juicers & Grinders",
          "Kitchen Storage & Containers",
          "Tableware & Dinnerware",
          "Barware",
          "Disposable Supplies",
        ],
      },
      {
        subCategory: "Home Cleaning & Bathroom Accessories",
        items: ["Cleaning Supplies", "HouseHold Supplies", "Bathroom Accessories"],
      },
      {
        subCategory: "Pet Supplies",
        items: [
          "Dogs",
          "Cats",
          "Birds",
          "Fish & Aquatic",
          "Horse",
          "Large Animals",
          "Small Animals",
          "Grooming & Hygiene",
          "Health & Safety",
        ],
      },
      {
        subCategory: "Home Furnishing",
        items: [
          "Bed Linen & Blankets",
          "Curtains & Accessories",
          "Bath Linen",
          "Floor Coverings",
          "Cushions & Pillows",
          "Covers & Protectors",
          "Kitchen & Table Linen",
          "Sofa & Curtain Fabrics",
        ],
      },
      {
        subCategory: "Home Decor",
        items: [
          "Stickers & Wallpapers",
          "Paintings & Posters",
          "Clocks",
          "Showpieces & Decor Accents",
          "Wall Decor Items",
          "Flowers & Vases",
          "Home Fragrance",
          "Windchimes & Dream catchers",
          "Photo Frames & Albums",
          "Diyas, Candles & Holders",
          "Hookah & Hookah Accessories",
        ],
      },
      {
        subCategory: "Furniture",
        items: [
          "Showcases",
          "Tables",
          "Furniture Accessories",
          "Shoe Racks & More",
          "Bean Bags",
          "Mattresses",
          "Shelves",
          "Dining Tables & Sets",
          "Bedroom Set",
          "Sofa Beds & More",
          "Beds & More",
          "Chairs",
          "Drawers",
          "TV Units & Cabinets",
          "Cabinets",
          "Wardrobes & More",
          "Stands",
          "Sofas",
        ],
      },
      {
        subCategory: "Festive Decor & Gifting",
        items: [
          "Festive Gifts",
          "Festive Decor",
          "Spiritual Items",
          "Fireworks & Crackers",
        ],
      },
      {
        subCategory: "Industrial & Scientific Supplies",
        items: [
          "Industrial Measurement Devices",
          "Packaging & Shipping Products",
          "Lab & Scientific Products",
          "Additive Manufacturing Products",
          "Industrial Testing Devices",
          "Safety Products",
        ],
      },
    ],
  },

  // ============ BEAUTY & HEALTH ============
  {
    mainCategory: "Beauty & Health",
    subcategories: [
      {
        subCategory: "Health Care",
        items: [
          "Professional medical supplies",
          "Sexual Wellness",
          "Home Medical Supplies",
          "Women's Safety",
          "Home Medicines",
          "Health Supplements",
          "Health Care Combo",
        ],
      },
      {
        subCategory: "Beauty and Grooming",
        items: [
          "Shaving & Beard Care",
          "Hair Care and Accessory",
          "Makeup",
          "Bath & Shower",
          "Body & Face Skin Care",
          "Fragrances",
          "Women's Personal Hygiene",
          "Oral Care",
        ],
      },
      {
        subCategory: "Health & Personal Care Appliances",
        items: ["Personal Care Appliances", "Health Care"],
      },
      {
        subCategory: "Baby Care",
        items: [
          "Diaper & Potty Training",
          "Baby Bath, Hair & Skin Care",
          "Baby Food",
          "Baby Feeding Bottle & Accessories",
          "Baby Feeding Utensils & Accessories",
          "Baby Grooming",
          "Baby Oral Care",
          "Baby Bedding",
          "Baby Gear",
          "Baby Medical & Health Care",
          "Baby Proofing & Safety",
          "Baby Cleaners & Detergents",
          "Maternity Care",
          "Baby Bathing Accessories",
          "Nursing & Breast Feeding",
          "Baby Gift Sets & Combo",
        ],
      },
    ],
  },

  // ============ GROCERY & FOOD ============
  {
    mainCategory: "Grocery & Food",
    subcategories: [
      {
        subCategory: "Food Products",
        items: [
          "Confectionery Products",
          "Edible Oil",
          "Ready Meal & Mixes",
          "Butter",
          "Food Combo",
          "Jams and Marmalade",
          "Vegetables",
          "Noodle",
          "Ice Cream",
          "Syrup",
          "Honey",
          "Buttermilk",
          "Milk",
          "Soft Drink Products",
          "Pickle",
          "Fruit Squash",
          "Ghee and Vanaspati",
          "Chocolates",
          "Soup and Dry Soup Mix",
          "Cake and Pastry Mix",
          "Pasta",
          "Dry Fruit, Nut & Seed",
          "Namkeen",
          "Instant Drink Mix",
          "Murabba and Gulkand",
          "Salt",
          "Rice",
          "Fruit Crush",
          "Pulses",
          "Fruits",
          "Tea Powder",
          "Papad",
          "Cereal Bars",
          "Condensed Milk",
          "Vermicelli",
          "Artificial Sweetener",
          "Sauce and Dip",
          "Biscuit, Cookie and Rusk",
          "Food Spreads",
          "Breakfast Cereal",
          "Chutneys",
          "Spice Powder and Masala",
          "Grain",
          "Herb and Seasoning",
          "Fruit Juice",
          "Meat",
          "Vinegar",
          "Fryum",
          "Paste and Puree",
          "Chips",
          "Jaggery",
          "Cheese",
          "Drinking Water",
          "Sugar",
          "Baking Ingredients and Essential Products",
          "Coffee Powder",
          "Flour and Sooji",
          "Seafood",
          "Milk Powder",
          "Sweets and Mixes",
          "Popcorn",
        ],
      },
    ],
  },

  // ============ SPORTS, BOOKS & GAMING ============
  {
    mainCategory: "Sports, Books & Gaming",
    subcategories: [
      {
        subCategory: "Books",
        items: [
          "Magazines",
          "Higher Education and Professional Books",
          "History and Archaeology Books",
          "Lifestyle, Hobby and Sport Books",
          "Test Preparation Books",
          "Literature Books",
          "Healthy Living and Wellness Books",
          "Biographies, Memoirs and General Non-Ficton Books",
          "Graphic Novels and Comics",
          "School Books",
          "Self-Help Books",
          "Philosophy and Religion Books",
          "Social Science Books",
          "Reference Books",
          "Arts, Language and Linguistic Books",
          "Children and Young Adult Books",
          "Other Books",
          "Economics, Business and Management Books",
          "Fiction Books",
        ],
      },
      {
        subCategory: "Gaming",
        items: [
          "Gaming Consoles",
          "Gaming Laptops",
          "Games",
          "Gaming Accessories",
          "Gaming Components",
        ],
      },
      {
        subCategory: "Music, Movies & Posters",
        items: ["Movies & TV Show"],
      },
      {
        subCategory: "Pens & Stationery",
        items: [
          "Calendars",
          "Pens",
          "Calculators",
          "Diaries & Notebooks",
          "Art Supplies",
          "Office Equipments",
          "Office Supplies",
          "College Supplies",
          "Tailoring & Embroidery Supplies",
          "Lab Equipment",
          "Office Electronics",
        ],
      },
      {
        subCategory: "Musical Instruments",
        items: [
          "String Instruments",
          "Wind Instruments",
          "Keys & Synthesizers",
          "Studio/Stage Equipment & Accessories",
          "Electronic Instruments",
          "Drums & Percussion",
          "Accessories",
        ],
      },
      {
        subCategory: "Exercise & Fitness",
        items: [
          "Fitness Accessories",
          "Fitness Equipment",
          "Yoga",
          "Pilates",
          "Mobility Aids & Equipments",
        ],
      },
      {
        subCategory: "Sports",
        items: [
          "Badminton",
          "Football",
          "Cricket",
          "Camping & Hiking",
          "Cycling",
          "Skating",
          "Boxing",
          "Volleyball",
          "Basketball",
          "Swimming",
          "Tennis",
          "Table Tennis",
          "Air hockey",
          "Archery",
          "Athletics",
          "Baseball",
          "Boating",
          "Boomerang",
          "Bowling",
          "Carrom",
          "Chess",
          "Climbing",
          "Darts",
          "Discus Throw",
          "Diving",
          "Fishing",
          "Foosball",
          "Frisbees",
          "Golf",
          "Handball",
          "Hobby Hunting",
          "Hockey",
          "Horse Riding",
          "Jumping Trainers",
          "Kayaking",
          "Kite Flying",
          "Laccrose",
          "Netball",
          "Other Ball Sports",
          "Pickleball",
          "Pool",
          "Rugby",
          "Running",
          "Scooters",
          "Scuba Diving",
          "Shooting",
          "Slacklining",
          "Sport Accessories",
          "Squash",
          "Surfing",
          "Throwball",
          "Water Polo",
        ],
      },
      {
        subCategory: "Toys and Games",
        items: [
          "Action Toys",
          "Hobby Organizers & Collectibles",
          "Puzzles and Cubes",
          "Sports Toys",
          "Musical Toys",
          "LCD Writing Pads",
          "Indoor Games",
          "Electronic Kits",
          "Art and Craft",
          "Role Play Toys",
          "Outdoor Toys",
          "Tricycles and Rideons",
          "Dolls & Doll Houses",
          "Baby Toys",
          "Soft Toys",
          "Toy Vehicles",
          "Novelty Toys",
          "Learning and Educational Toys",
        ],
      },
    ],
  },

  // ============ AUTOMOTIVE ============
  {
    mainCategory: "Automotive",
    subcategories: [
      {
        subCategory: "Automotive Accessories",
        items: [
          "Vehicle Mats",
          "Tyre and Wheel",
          "Vehicle Safety, Security and Guards",
          "Car Dashboard Accessories",
          "Car Air Purifiers and Air Fresheners",
          "Vehicle Cleaners",
          "Vehicle Styling",
          "Vehicle Stereo and Music System",
          "Vehicle Door, Windshield, Windows and Mirrors",
          "Vehicle Utility Accessories",
          "Oils and Lubricants",
          "Vehicle Body Covers",
          "Spares, Tools and Maintenance Service Parts",
          "Vehicle Storage and Organizers",
          "Helmets and Riding Gear",
          "Vehicle Seat and Accessories",
          "Vehicle Lights",
          "Automotive Combos",
          "Vehicle Repair",
        ],
      },
      {
        subCategory: "Vehicles",
        items: ["Bikes & Scooters"],
      },
    ],
  },
];

async function seedCategoryHierarchy() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("🗑️  Clearing existing categories...");
    await Category.deleteMany({});

    let totalCount = 0;
    const insertedData = [];

    for (const mainCat of CATEGORY_HIERARCHY) {
      for (const subCat of mainCat.subcategories) {
        for (const item of subCat.items) {
          const categoryDoc = {
            mainCategory: mainCat.mainCategory,
            subCategory: subCat.subCategory,
            subSubCategory: item,
            isActive: true,
          };

          await Category.create(categoryDoc);
          insertedData.push(categoryDoc);
          totalCount++;
        }
      }
    }

    console.log("\n✅ Category Hierarchy Seeding Completed!\n");
    console.log(`📊 Total Categories Inserted: ${totalCount}\n`);

    // Display statistics
    const mainCategories = [
      ...new Set(insertedData.map((d) => d.mainCategory)),
    ];
    console.log(`📈 Main Categories: ${mainCategories.length}`);
    mainCategories.forEach((cat) => {
      const subCats = [
        ...new Set(
          insertedData
            .filter((d) => d.mainCategory === cat)
            .map((d) => d.subCategory)
        ),
      ];
      const items = insertedData.filter((d) => d.mainCategory === cat);
      console.log(`   • ${cat}: ${subCats.length} sub-categories, ${items.length} sub-sub-categories`);
    });

    console.log("\n✨ Ready for attribute mapping!");
    console.log(
      "📝 Next step: Provide attributes for each sub-sub-category\n"
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding category hierarchy:", error);
    process.exit(1);
  }
}

seedCategoryHierarchy();
