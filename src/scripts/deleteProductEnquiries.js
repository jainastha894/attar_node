import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ProductEnquiry from "../models/productEnquiry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGOURL || process.env.MONGODB_URI || "mongodb://localhost:27017/attarchand";

async function deleteAllProductEnquiries() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Count existing enquiries
    const countBefore = await ProductEnquiry.countDocuments();
    console.log(`\n=== Found ${countBefore} product enquiries ===`);

    if (countBefore === 0) {
      console.log("No product enquiries to delete. Database is already clean.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all product enquiries
    const result = await ProductEnquiry.deleteMany({});
    console.log(`\n✅ Successfully deleted ${result.deletedCount} product enquiries`);

    // Verify deletion
    const countAfter = await ProductEnquiry.countDocuments();
    console.log(`\n=== Verification: ${countAfter} product enquiries remaining ===`);

    if (countAfter === 0) {
      console.log("✅ All product enquiries have been deleted successfully!");
    } else {
      console.log("⚠️  Warning: Some enquiries may still exist");
    }

    console.log("\n=== Deletion Complete ===");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error deleting product enquiries:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

deleteAllProductEnquiries();
