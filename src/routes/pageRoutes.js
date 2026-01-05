import express from "express";
import {
  renderHome,
  renderAbout,
  renderContact,
  renderShop,
  renderPrivacy,
  renderTerms,
  submitContactForm
} from "../controllers/pageController.js";
import { getAllProducts } from "../controllers/productController.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route to serve images with proper headers for WhatsApp compatibility
router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "public", "uploads", filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, serve default image
    const defaultPath = path.join(__dirname, "..", "public", "uploads", "default.png");
    if (fs.existsSync(defaultPath)) {
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      return res.sendFile(defaultPath);
    }
    return res.status(404).send("Image not found");
  }
  
  // Determine content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const contentTypeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
  };
  
  const contentType = contentTypeMap[ext] || "image/jpeg";
  
  // Set headers for proper image viewing
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross-origin access
  
  res.sendFile(filePath);
});

router.get("/", renderHome);
router.get("/about", renderAbout);
router.get("/contact", renderContact);
router.post("/contact", submitContactForm);
router.get("/shop", renderShop);
router.get("/privacy", renderPrivacy);
router.get("/terms", renderTerms);


export default router;
