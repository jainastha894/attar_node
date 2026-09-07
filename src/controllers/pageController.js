import fs from "fs";
import path from "path";
import Lead from "../models/lead.js";
import Product from "../models/product.js";
import ProductEnquiry from "../models/productEnquiry.js";
import { productSchema, productPath, productImages, siteUrl } from '../services/seoService.js';

// Load SEO JSON once
const seoPath = path.join(process.cwd(), "src", "config", "seo.json");
const seo = JSON.parse(fs.readFileSync(seoPath, "utf8"));

// Load Units JSON once
const unitsPath = path.join(process.cwd(), "src/config/units.json");

export const renderHome = async (req, res) => {
  try {
    // Get signature products (max 3)
    const signatureProducts = await Product.find({
      active: true,
      signature: true
    }).limit(3).sort({ updatedAt: -1 });

    // Get base URL for image links - use production domain
    const baseUrl = siteUrl();

    res.render("index", {
      seoData: seo.home,
      signatureProducts: signatureProducts || [],
      baseUrl
    });
  } catch (error) {
    console.error("Home page error:", error);
    const baseUrl = siteUrl();
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

export const submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    // Create new lead
    const lead = new Lead({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      status: "new"
    });

    await lead.save();
    console.log('✅ New lead created:', lead._id);

    res.json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you soon."
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting form. Please try again."
    });
  }
};

export const renderShop = async (req, res) => {
  try {
    const { industry } = req.query;

    // Read units dynamically to get latest updates
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

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

    const baseUrl = siteUrl();

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

export const renderProduct = async (req, res, next) => {
  try {
    if (!/^[a-f0-9]{24}$/i.test(req.params.id)) return next();
    const product = await Product.findOne({ _id: req.params.id, active: true }).lean();
    if (!product) return next();
    const baseUrl = siteUrl();
    const canonical = baseUrl + productPath(product);
    const schema = { '@context': 'https://schema.org', '@graph': [
      productSchema(product, baseUrl),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl + '/' },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: baseUrl + '/shop' },
        { '@type': 'ListItem', position: 3, name: product.name, item: canonical }
      ] }
    ] };
    res.render('product', { product, canonical, schema, images: productImages(product, baseUrl),
      enquiryUrl: `https://wa.me/919811555255?text=${encodeURIComponent(`Hello, I would like a wholesale quotation for ${product.name}. ${canonical}`)}` });
  } catch (error) { next(error); }
};

export const renderTerms = (req, res) => {
  res.render("terms");
};

export const trackProductEnquiry = async (req, res) => {
  try {
    const { productId, productName, industry, source } = req.body;

    // For floating button, use default name
    const enquiry = new ProductEnquiry({
      productId: productId || null,
      productName: productName || "Business Enquiry (Floating)",
      industry: industry || null,
      source: source || "floating",
      clickedAt: new Date()
    });

    await enquiry.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Product enquiry tracking error:", error);
    res.status(500).json({ success: false });
  }
};
