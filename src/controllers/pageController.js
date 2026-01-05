import path from "path";
import Product from "../models/product.js";
import fs from "fs";

// Load SEO JSON once
const seoPath = path.join(process.cwd(), "src", "config", "seo.json");
const seo = JSON.parse(fs.readFileSync(seoPath, "utf8"));

// Load Units JSON once
const unitsPath = path.join(process.cwd(), "src/config/units.json");
const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

export const renderHome = async (req, res) => {
  try {
    // Get signature products (max 3)
    const signatureProducts = await Product.find({ 
      active: true, 
      signature: true 
    }).limit(3).sort({ updatedAt: -1 });
    
    // Get base URL for image links - use production domain
    const baseUrl = process.env.BASE_URL || 'https://arjanmalattarchand.com';
    
    res.render("index", { 
      seoData: seo.home,
      signatureProducts: signatureProducts || [],
      baseUrl
    });
  } catch (error) {
    console.error("Home page error:", error);
    const baseUrl = process.env.BASE_URL || 'https://arjanmalattarchand.com';
    res.render("index", { 
      seoData: seo.home,
      signatureProducts: [],
      baseUrl
    });
  }
};

export const renderAbout = (req, res) => {
  res.render("about", { seoData: seo.about });
};

export const renderContact = (req, res) => {
  res.render("contact", { seoData: seo.contact });
};

export const renderShop = async (req, res) => {
  try {
    const { industry } = req.query;

    const products = await Product.find({ active: true });

    // Convert Mongoose documents to plain objects and handle Map type units
    let productsArray = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      // Convert Map to plain object if units is a Map
      if (productObj.units && productObj.units instanceof Map) {
        productObj.units = Object.fromEntries(productObj.units);
      }
      return productObj;
    });

    let filteredProducts = productsArray;

    // Filter by industry if specified
    if (industry) {
      console.log('Filtering products by industry:', industry);
      filteredProducts = productsArray.filter(p => {
        const industryList = p.units?.industryList || [];
        // Handle both array and single value cases
        if (Array.isArray(industryList)) {
          const matches = industryList.includes(industry);
          if (matches) {
            console.log(`Product "${p.name}" matches industry "${industry}"`);
          }
          return matches;
        }
        return false;
      });
      console.log(`Filtered ${filteredProducts.length} products for industry "${industry}"`);
    }

    const baseUrl = process.env.BASE_URL || "https://arjanmalattarchand.com";

    res.render("shop", {
      seoData: seo.shop,
      products: filteredProducts,
      units: unitsData,
      baseUrl,
      selectedIndustry: industry || "All"
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
