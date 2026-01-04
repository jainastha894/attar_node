import fs from "fs";
import path from "path";
import Product from "../models/product.js";
import Admin from "../models/admin.js";
import passport from "passport";
import bcrypt from "bcryptjs";


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
    units: unitsData,
    product: null,
    isEdit: false
  });
};

export const addProduct = async (req, res) => {
  try {
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    // 1️⃣ Basic fields
    const { productName, description } = req.body;

    // 2️⃣ Images → store relative paths (relative to static directory)
    const imagePaths = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    // 3️⃣ Dynamic units
    const selectedUnits = {};

    for (const unitKey in unitsData) {
      if (req.body[unitKey]) {
        // Handle industryList as single value, others as arrays
        if (unitKey === 'industryList') {
          selectedUnits[unitKey] = [req.body[unitKey]];
        } else {
        selectedUnits[unitKey] = Array.isArray(req.body[unitKey])
          ? req.body[unitKey]
          : [req.body[unitKey]];
        }
      }
    }

    // 4️⃣ Boolean flags (unchecked = undefined)
    const product = new Product({
      name: productName,
      description,
      images: imagePaths.length > 0 ? imagePaths : ["/uploads/default.png"],
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

export const productListPage = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("admin/products", { products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error loading products");
  }
};

export const profilePage = async(req, res) => {
  try {
    let totalproducts = await Product.countDocuments();
    let activeproducts = await Product.countDocuments({active:true});

    // Get admin data
    const admin = await Admin.findOne({ username: req.user?.username || "ArjanAttarsAdmin" });
    
    res.render("admin/profile", {
      totalproducts,
      activeproducts,
      admin: admin || null
    });
  } catch (error) {
    console.error("Profile page error:", error);
    res.status(500).send("Error loading profile");
  }
};

export const profileSettingsPage = async (req, res) => {
  try {
    // Get admin data
    const admin = await Admin.findOne({ username: req.user?.username || "ArjanAttarsAdmin" });
    
    res.render("admin/profileSetting", {
      admin: admin || null
    });
  } catch (error) {
    console.error("Profile settings page error:", error);
    res.status(500).send("Error loading profile settings");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, role, bio } = req.body;
    let username = "ArjanAttarsAdmin";
    
    // Try to get username from user object
    if (req.user) {
      if (typeof req.user === 'object' && req.user.username) {
        username = req.user.username;
      } else if (typeof req.user === 'string') {
        // If user is just an ID, find the admin
        const adminById = await Admin.findById(req.user);
        if (adminById) {
          username = adminById.username;
        }
      }
    }
    
    let admin = await Admin.findOne({ username });
    
    if (!admin) {
      // Create admin if doesn't exist
      const hashedPassword = await bcrypt.hash("addingproducts200", 10);
      admin = new Admin({
        username: "ArjanAttarsAdmin",
        password: hashedPassword,
        fullName: fullName || "Admin User",
        email: email || "",
        phone: phone || "",
        role: role || "Administrator",
        bio: bio || ""
      });
    } else {
      // Update existing admin
      if (fullName) admin.fullName = fullName;
      if (email !== undefined) admin.email = email;
      if (phone !== undefined) admin.phone = phone;
      if (role) admin.role = role;
      if (bio !== undefined) admin.bio = bio;
    }
    
    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if exists
      if (admin.profilePic) {
        const oldPicPath = path.join(process.cwd(), "src", "public", admin.profilePic);
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath);
        }
      }
      admin.profilePic = `/uploads/${req.file.filename}`;
    }
    
    await admin.save();
    
    res.json({ success: true, message: "Profile updated successfully", admin });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

export const removeProfilePic = async (req, res) => {
  try {
    let username = "ArjanAttarsAdmin";
    
    // Try to get username from user object
    if (req.user) {
      if (typeof req.user === 'object' && req.user.username) {
        username = req.user.username;
      } else if (typeof req.user === 'string') {
        // If user is just an ID, find the admin
        const adminById = await Admin.findById(req.user);
        if (adminById) {
          username = adminById.username;
        }
      }
    }
    
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    
    // Delete profile picture file if exists
    if (admin.profilePic) {
      const picPath = path.join(process.cwd(), "src", "public", admin.profilePic);
      if (fs.existsSync(picPath)) {
        fs.unlinkSync(picPath);
      }
    }
    
    admin.profilePic = null;
    await admin.save();
    
    res.json({ success: true, message: "Profile picture removed successfully", admin });
  } catch (error) {
    console.error("Remove profile pic error:", error);
    res.status(500).json({ success: false, message: "Error removing profile picture" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let username = "ArjanAttarsAdmin";
    
    // Try to get username from user object
    if (req.user) {
      if (typeof req.user === 'object' && req.user.username) {
        username = req.user.username;
      } else if (typeof req.user === 'string') {
        // If user is just an ID, find the admin
        const adminById = await Admin.findById(req.user);
        if (adminById) {
          username = adminById.username;
        }
      }
    }
    
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    
    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }
    
    // Update password
    admin.password = newPassword; // Will be hashed by pre-save hook
    await admin.save();
    
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Error changing password" });
  }
};

export const catalogPage = async (req, res) => {
  try {
    const unitsPath = path.join(process.cwd(), "src/config/units.json");
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
    const products = await Product.find({ active: true }).sort({ name: 1 });
    res.render("admin/catalog", {
      products,
      units: unitsData
    });
  } catch (error) {
    console.error("Catalog page error:", error);
    res.status(500).send("Error loading catalog page");
  }
};

export const editProductPage = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    const unitsPath = path.join(process.cwd(), "src/config/units.json");
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
    // Convert Mongoose document to plain object for EJS template
    const productObj = product.toObject();
    res.render("admin/add-product", {
      product: productObj,
      units: unitsData,
      isEdit: true
    });
  } catch (error) {
    console.error("Edit product page error:", error);
    res.status(500).send("Error loading edit page");
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    const { productName, description } = req.body;

    // Get existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    // Handle images - keep existing if no new ones uploaded
    let imagePaths = existingProduct.images || [];
    if (req.files && req.files.length > 0) {
      // Replace with new images if uploaded
      imagePaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Dynamic units - build from req.body (only selected items will be included)
    const selectedUnits = {};
    for (const unitKey in unitsData) {
      if (unitKey === 'industryList') {
        // Industry is a single select
        if (req.body[unitKey]) {
          selectedUnits[unitKey] = [req.body[unitKey]];
        }
      } else {
        // Multi-select checkboxes - will be an array if checked, undefined if none checked
        if (req.body[unitKey]) {
          const values = Array.isArray(req.body[unitKey])
            ? req.body[unitKey]
            : [req.body[unitKey]];
          if (values.length > 0 && values[0]) {
            selectedUnits[unitKey] = values;
          }
        }
        // If not in req.body, it means nothing was selected, so don't include it
      }
    }

    // Update product
    const updateData = {
      name: productName,
      description,
      images: imagePaths.length > 0 ? imagePaths : ["/uploads/default.png"],
      units: selectedUnits,
      featured: !!req.body.featured,
      topRated: !!req.body.topRated,
      bestSeller: !!req.body.bestSeller,
      onSale: !!req.body.onSale,
      outofstock: !!req.body.outofstock,
      active: !!req.body.active
    };

    await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).send("Error updating product: " + err.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

export const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const product = await Product.findByIdAndUpdate(id, { active }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: `Product ${active ? 'activated' : 'deactivated'} successfully`, product });
  } catch (error) {
    console.error("Toggle active error:", error);
    res.status(500).json({ success: false, message: "Error updating product status" });
  }
};

export const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { outofstock } = req.body;
    const product = await Product.findByIdAndUpdate(id, { outofstock }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: `Product marked as ${outofstock ? 'out of stock' : 'in stock'}`, product });
  } catch (error) {
    console.error("Toggle stock error:", error);
    res.status(500).json({ success: false, message: "Error updating stock status" });
  }
};

export const toggleSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;
    
    // If trying to add signature, check if we already have 3
    if (signature) {
      const signatureCount = await Product.countDocuments({ signature: true });
      if (signatureCount >= 3) {
        return res.status(400).json({ 
          success: false, 
          message: "Maximum 3 signature products allowed. Please remove a signature product first." 
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(id, { signature }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ 
      success: true, 
      message: `Product ${signature ? 'added to' : 'removed from'} signature collection`, 
      product 
    });
  } catch (error) {
    console.error("Toggle signature error:", error);
    res.status(500).json({ success: false, message: "Error updating signature status" });
  }
};
export const adminLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/admin?error=invalid");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/administrator");
    });
  })(req, res, next);
};
export const adminLogout = (req, res) => {
  req.logout(() => {
    res.redirect("/admin");
  });
};