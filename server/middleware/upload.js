import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const storage = multer.memoryStorage(); // store files in memory buffer
const upload = multer({ storage });

// ----------------------------------------------
// Upload file buffer to Cloudinary (stream)
// ----------------------------------------------
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// ----------------------------------------------
// Middleware to handle single file upload
// Usage: uploadSingle("image", "products")
// ----------------------------------------------
export const uploadSingle = (folder) => {
  return async (req, res, next) => {
    console.log("REQ FILE:", req.file);
    try {
      if (!req.file) return next();

      const result = await uploadToCloudinary(req.file.buffer, folder);
      req.fileUrl = result.secure_url;

      next();
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  };
};

// ----------------------------------------------
// Export multer instance to use in routes
// ----------------------------------------------
export default upload;
