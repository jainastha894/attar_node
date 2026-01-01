import fs from "fs";
import path from "path";
import Product from "../models/product.js";
import passport from "passport";


const unitsPath = path.join(process.cwd(), "src/config/units.json");

export const unitsPage = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
    res.render("admin/units", {
    units: unitsData
  });
};

export const addProductPage = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
  res.render("admin/add-product", {
    units: unitsData
  });
};

export const addProduct = async (req, res) => {
  try {
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    // 1️⃣ Basic fields
    const { productName, description } = req.body;

    // 2️⃣ Images → store relative paths
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    //should be relative to shop.ejs

    // 3️⃣ Dynamic units
    const selectedUnits = {};

    for (const unitKey in unitsData) {
      if (req.body[unitKey]) {
        selectedUnits[unitKey] = Array.isArray(req.body[unitKey])
          ? req.body[unitKey]
          : [req.body[unitKey]];
      }
    }

    // 4️⃣ Boolean flags (unchecked = undefined)
    const product = new Product({
      name: productName,
      description,
      images: imagePaths,
      units: selectedUnits,

      featured: !!req.body.featured,
      topRated: !!req.body.topRated,
      bestSeller: !!req.body.bestSeller,
      onSale: !!req.body.onSale,
      outofstock: !!req.body.outofstock,
      active: !!req.body.active
    });

    await product.save();

   res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding product");
  }
};

export const addUnit = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

  const { unitType, newUnit } = req.body;

  if (unitsData[unitType]) {
    unitsData[unitType].push(newUnit);
  }

  fs.writeFileSync(unitsPath, JSON.stringify(unitsData, null, 2));
  res.redirect("/admin/units");
};

export const removeUnit = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

  const { unitType, value } = req.body;

  if (!unitType || !value || !unitsData[unitType]) {
    return res.redirect("/admin/units");
  }

  // remove value
  unitsData[unitType] = unitsData[unitType].filter(
    item => item !== value
  );

  fs.writeFileSync(unitsPath, JSON.stringify(unitsData, null, 2));

  res.redirect("/admin/units");
};

export const loginPage = (req, res) => {
  res.render("admin/login");
};

export const dashboardPage = async(req, res) => {
    let totalproducts= await Product.countDocuments();
  let featuredproducts= await Product.countDocuments({featured:true});
  let outofstockproducts= await Product.countDocuments({outofstock:true});
  let activeproducts= await Product.countDocuments({active:true});

  res.render("admin/dashboard", {
    totalproducts,
    featuredproducts,
    outofstockproducts,
    activeproducts
  });
};

export const productListPage = (req, res) => {
  res.render("admin/products");
};

export const profilePage = async(req, res) => {
    let totalproducts= await Product.countDocuments();
  let activeproducts= await Product.countDocuments({active:true});

  res.render("admin/profile",
    {
      totalproducts, activeproducts
    }
  );
};
export const profileSettingsPage = (req, res) => {
  res.render("admin/profileSetting");
};
export const adminLogin = passport.authenticate("local",{
  successRedirect: "/administrator",
  failureRedirect: "/admin",
  failureFlash: true
});
export const adminLogout = (req, res) => {
  req.logout(() => {
    res.redirect("/admin");
  });
};