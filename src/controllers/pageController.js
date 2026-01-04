import path from "path";
import Product from "../models/product.js";
import fs from "fs";

// Load SEO JSON once
const seoPath = path.join(process.cwd(), "src", "config", "seo.json");
const seo = JSON.parse(fs.readFileSync(seoPath, "utf8"));

// Load Units JSON once
const unitsPath = path.join(process.cwd(), "src/config/units.json");
const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

export const renderHome = (req, res) => {
  res.render("index", { seoData: seo.home });
};

export const renderAbout = (req, res) => {
  res.render("about", { seoData: seo.about });
};

export const renderContact = (req, res) => {
  res.render("contact", { seoData: seo.contact });
};

export const renderShop = async (req, res) => {
  try {
    // Only show active products on shop page
    const products = await Product.find({ active: true });
    res.render("shop", {
      seoData: seo.shop,
      products,
      units: unitsData
    });
  } catch (error) {
    console.error("Shop page error:", error);
    res.status(500).send("Something went wrong");
  }
};

export const renderPrivacy = (req, res) => {
  res.render("privacy");
};

export const renderTerms = (req, res) => {
  res.render("terms");
};