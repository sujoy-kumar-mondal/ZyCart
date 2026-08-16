import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "../models/Admin.js";

// Load environment variables from server/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const ALL_PERMISSIONS = [
  "manage_users",
  "manage_sellers",
  "manage_orders",
  "manage_products",
  "manage_categories",
  "manage_admins",
  "view_analytics",
  "system_settings",
];

const isStrongPassword = (pwd) => {
  if (!pwd || pwd.length < 8) return false;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

async function createSuperAdmin() {
  const email = (process.argv[2] || process.env.SUPER_ADMIN_EMAIL || "admin@zycart.com").toLowerCase().trim();
  const password = process.argv[3] || process.env.SUPER_ADMIN_PASSWORD || "Admin@ZyCart2026";
  const mobile = process.argv[4] || process.env.SUPER_ADMIN_MOBILE || "9876543210";
  const name = process.argv[5] || "Super Admin";

  console.log("=========================================");
  console.log("🔒 ZyCart Super Admin Provisioning Script");
  console.log("=========================================");

  if (!email || !email.includes("@")) {
    console.error("❌ Error: A valid email address is required.");
    process.exit(1);
  }

  if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
    console.error("❌ Error: Mobile number must be a valid 10-digit number.");
    process.exit(1);
  }

  if (!isStrongPassword(password)) {
    console.error(
      "❌ Error: Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special symbol."
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ Error: MONGO_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB Database");

    let admin = await Admin.findOne({ email });

    if (admin) {
      console.log(`ℹ️  Existing admin account found for '${email}'. Updating to Super Admin...`);
      admin.name = name;
      admin.role = "super_admin";
      admin.mobile = String(mobile).trim();
      admin.permissions = ALL_PERMISSIONS;
      admin.isActive = true;
      admin.password = password; // Will be hashed automatically by pre('save') middleware
      await admin.save();
      console.log(`🚀 Successfully updated existing account '${email}' to Super Admin!`);
    } else {
      console.log(`Creating new Super Admin account for '${email}'...`);
      admin = await Admin.create({
        name,
        email,
        password,
        mobile: String(mobile).trim(),
        role: "super_admin",
        permissions: ALL_PERMISSIONS,
        isActive: true,
      });
      console.log(`🎉 Super Admin account '${email}' created successfully!`);
    }

    console.log("-----------------------------------------");
    console.log(`👤 Name:        ${admin.name}`);
    console.log(`📧 Email:       ${admin.email}`);
    console.log(`📱 Mobile:      ${admin.mobile}`);
    console.log(`👑 Role:        ${admin.role}`);
    console.log(`🔑 Permissions: All (${admin.permissions.length} granted)`);
    console.log("=========================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Script Execution Failed:", error.message);
    process.exit(1);
  }
}

createSuperAdmin();
