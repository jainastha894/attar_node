import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Product from "../models/product.js";
import Units from "../models/units.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const mongoUri = process.env.MONGOURL || process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("MONGOURL not found in .env");
  process.exit(1);
}

const bottles = [
  {
    name: "Luxury Gold Decanter Bottle #001 (150ml)",
    description: "150ml luxury hexagonal bell-shaped attar decanter bottle crafted with clear glass, gold electroplated accents, star/lantern patterns, and an ornamental crown stopper. Ideal for ittar, oud, and luxury fragrance gifting. Wholesale carton packing: 40 pieces.",
    images: ["/uploads/bottle-001-150ml.jpg"],
    units: {
      industryList: ["Fragrance"],
      subCategoryList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"],
      sizeList: ["150ml"],
      colorList: ["Gold", "Clear"],
      shapeList: ["Hexagonal"],
      materialList: ["Aluminium & Glass"],
      jarBottleList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"]
    },
    active: true,
    featured: true,
    bestSeller: true
  },
  {
    name: "Luxury Gold Decanter Bottle #004 (150ml)",
    description: "150ml luxury hexagonal fluted glass bottle featuring ornate gold arch gate motifs and a faceted gold stopper. Designed for premium attar and perfume packaging. Wholesale carton packing: 40 pieces.",
    images: ["/uploads/bottle-004-150ml.jpg"],
    units: {
      industryList: ["Fragrance"],
      subCategoryList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"],
      sizeList: ["150ml"],
      colorList: ["Gold", "Clear"],
      shapeList: ["Hexagonal"],
      materialList: ["Aluminium & Glass"],
      jarBottleList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"]
    },
    active: true,
    featured: true,
    bestSeller: true
  },
  {
    name: "Luxury Gold Decanter Bottle #006 (150ml)",
    description: "150ml teardrop shield profile luxury perfume decanter with a heavy polished gold border frame, floral center filigree, and flared gold stopper. Wholesale carton packing: 40 pieces.",
    images: ["/uploads/bottle-006-150ml.jpg"],
    units: {
      industryList: ["Fragrance"],
      subCategoryList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"],
      sizeList: ["150ml"],
      colorList: ["Gold", "Clear"],
      shapeList: ["Teardrop"],
      materialList: ["Aluminium & Glass"],
      jarBottleList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"]
    },
    active: true,
    featured: true,
    bestSeller: true
  },
  {
    name: "Luxury Gold Decanter Bottle #018 (250ml)",
    description: "250ml tall rectangular arch luxury decanter bottle featuring Greek-key and arabesque gold screen-printed designs with a spherical gold ball stopper. Wholesale carton packing: 30 pieces.",
    images: ["/uploads/bottle-018-250ml.jpg"],
    units: {
      industryList: ["Fragrance"],
      subCategoryList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"],
      sizeList: ["250ml"],
      colorList: ["Gold", "Clear"],
      shapeList: ["Square"],
      materialList: ["Aluminium & Glass"],
      jarBottleList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"]
    },
    active: true,
    featured: true,
    bestSeller: true
  },
  {
    name: "Luxury Gold Decanter Bottle #024 (250ml)",
    description: "250ml double-bulb gourd shaped luxury glass bottle featuring twin gold filigree bands and an elongated teardrop stopper. Wholesale carton packing: 24 pieces.",
    images: ["/uploads/bottle-024-250ml.jpg"],
    units: {
      industryList: ["Fragrance"],
      subCategoryList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"],
      sizeList: ["250ml"],
      colorList: ["Gold", "Clear"],
      shapeList: ["Round"],
      materialList: ["Aluminium & Glass"],
      jarBottleList: ["Aluminium Bottles", "Perfume Bottles", "Ittar Bottles"]
    },
    active: true,
    featured: true,
    bestSeller: true
  }
];

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log(" Connected to database.");

    // 1. Sync Units from units.json if exists
    const unitsPath = path.join(process.cwd(), "src/config/units.json");
    if (fs.existsSync(unitsPath)) {
      const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
      let dbUnits = await Units.findOne();
      if (dbUnits) {
        Object.keys(unitsData).forEach(key => {
          dbUnits[key] = unitsData[key];
        });
        await dbUnits.save();
        console.log(" Units updated in database.");
      }
    }

    // 2. Add or update each product
    for (const bottle of bottles) {
      const existing = await Product.findOne({ name: bottle.name });
      if (existing) {
        existing.description = bottle.description;
        existing.images = bottle.images;
        existing.units = bottle.units;
        existing.active = bottle.active;
        existing.featured = bottle.featured;
        existing.bestSeller = bottle.bestSeller;
        await existing.save();
        console.log(` Updated: ${bottle.name}`);
      } else {
        await Product.create(bottle);
        console.log(` Created: ${bottle.name}`);
      }
    }

    console.log(" All 5 bottles successfully stored in MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error(" Error seeding bottles:", err);
    process.exit(1);
  }
}

run();
