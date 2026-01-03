import path from "path";
import Product from "../models/product.js";
import fs from "fs";

// Load SEO JSON once
const seoPath = path.join(process.cwd(), "src", "config", "seo.json");
const seo = JSON.parse(fs.readFileSync(seoPath, "utf8"));

export const renderHome = (req, res) => {
  res.render("index", { seoData: seo.home });
};

export const renderAbout = (req, res) => {
  res.render("about", { seoData: seo.about });
};

export const renderContact = (req, res) => {
  res.render("contact", { seoData: seo.contact });
};

export const renderShop = async(req, res) => {
  const products = await Product.find();
  res.render("shop", { seoData: seo.shop, products });
};
