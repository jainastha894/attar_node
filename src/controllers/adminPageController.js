import fs from "fs";
import path from "path";
import Product from "../models/product.js";
import Admin from "../models/admin.js";
import Lead from "../models/lead.js";
import ProductEnquiry from "../models/productEnquiry.js";
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
    isEdit: false,
    query: req.query
  });
};

export const addProduct = async (req, res) => {
  try {
    console.log('=== Add Product Request ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? req.files.map(f => f.filename) : 'No files');
    
    const unitsPath = path.join(process.cwd(), "src/config/units.json");
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    // 1️⃣ Basic fields
    const { productName, description } = req.body;

    if (!productName || !description) {
      console.error('Validation failed: Product name or description missing');
      return res.redirect("/admin/products/add?error=" + encodeURIComponent("Product name and description are required"));
    }

    // 2️⃣ Images → store relative paths (relative to static directory)
    const imagePaths = req.files && req.files.length > 0
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    // 3️⃣ Dynamic units - capture ALL unit fields from form
    const selectedUnits = {};

    // Process all unit types from unitsData
    for (const unitKey in unitsData) {
      if (req.body[unitKey]) {
        // Handle industryList as single value, others as arrays
        if (unitKey === 'industryList') {
          // Industry is a single select dropdown
          selectedUnits[unitKey] = [req.body[unitKey]];
        } else {
          // Multi-select checkboxes (sizeList, colorList, fragranceList, etc.)
          const values = Array.isArray(req.body[unitKey])
          ? req.body[unitKey]
          : [req.body[unitKey]];
          // Filter out empty values
          const filteredValues = values.filter(val => val && val.trim() !== '');
          if (filteredValues.length > 0) {
            selectedUnits[unitKey] = filteredValues;
          }
        }
      }
    }

    // Also check for fragranceList specifically (it might be conditionally shown)
    if (req.body.fragranceList) {
      const fragranceValues = Array.isArray(req.body.fragranceList)
        ? req.body.fragranceList
        : [req.body.fragranceList];
      const filteredFragrance = fragranceValues.filter(val => val && val.trim() !== '');
      if (filteredFragrance.length > 0) {
        selectedUnits.fragranceList = filteredFragrance;
      }
    }

    console.log('Selected units:', JSON.stringify(selectedUnits, null, 2));

    // 4️⃣ Boolean flags - explicitly set all flags from form
    const product = new Product({
      name: productName.trim(),
      description: description.trim(),
      images: imagePaths.length > 0 ? imagePaths : ["/uploads/default.png"],
      units: selectedUnits, // Mongoose will convert plain object to Map automatically

      featured: req.body.featured === 'on' || req.body.featured === true,
      topRated: req.body.topRated === 'on' || req.body.topRated === true,
      bestSeller: req.body.bestSeller === 'on' || req.body.bestSeller === true,
      onSale: req.body.onSale === 'on' || req.body.onSale === true,
      outofstock: req.body.outofstock === 'on' || req.body.outofstock === true,
      active: req.body.active === 'on' || req.body.active === true || req.body.active === undefined, // Default to true if not specified
      signature: false // Default to false, can be set later via toggle
    });

    // Save to database
    console.log('Attempting to save product to database...');
    const savedProduct = await product.save();
    console.log('✅ Product saved successfully to database:', savedProduct._id);
    console.log('Product name:', savedProduct.name);
    console.log('Product description:', savedProduct.description);
    console.log('Product images:', savedProduct.images);
    console.log('Product units:', Object.fromEntries(savedProduct.units || new Map()));
    console.log('Product flags - featured:', savedProduct.featured, 'topRated:', savedProduct.topRated, 'bestSeller:', savedProduct.bestSeller, 'onSale:', savedProduct.onSale, 'outofstock:', savedProduct.outofstock, 'active:', savedProduct.active);

    res.redirect("/admin/products");
  } catch (err) {
    console.error("❌ Error adding product to database:", err);
    console.error("Error stack:", err.stack);
    return res.redirect("/admin/products/add?error=" + encodeURIComponent("Error adding product: " + err.message));
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
  try {
    let totalproducts = await Product.countDocuments();
    let featuredproducts = await Product.countDocuments({featured:true});
    let outofstockproducts = await Product.countDocuments({outofstock:true});
    let activeproducts = await Product.countDocuments({active:true});
    
    // Lead statistics
    let totalLeads = await Lead.countDocuments();
    let newLeads = await Lead.countDocuments({status: "new"});
    let contactedLeads = await Lead.countDocuments({status: "contacted"});
    let inProgressLeads = await Lead.countDocuments({status: "in_progress"});
    let resolvedLeads = await Lead.countDocuments({status: "resolved"});

    // Product Enquiry statistics
    let totalEnquiries = await ProductEnquiry.countDocuments();
    
    // Industry-wise enquiries
    let fragranceEnquiries = await ProductEnquiry.countDocuments({ industry: "Fragrance" });
    let foodEnquiries = await ProductEnquiry.countDocuments({ industry: "Food" });
    let pharmaEnquiries = await ProductEnquiry.countDocuments({ industry: "Pharma" });
    
    // Top query generated product
    const topProduct = await ProductEnquiry.aggregate([
      {
        $group: {
          _id: {
            productId: "$productId",
            productName: "$productName"
          },
          clicks: { $sum: 1 },
          productName: { $first: "$productName" }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 1 }
    ]);

    res.render("admin/dashboard", {
      totalproducts,
      featuredproducts,
      outofstockproducts,
      activeproducts,
      totalLeads,
      newLeads,
      contactedLeads,
      inProgressLeads,
      resolvedLeads,
      totalEnquiries,
      fragranceEnquiries,
      foodEnquiries,
      pharmaEnquiries,
      topProduct: topProduct.length > 0 ? {
        name: topProduct[0].productName,
        clicks: topProduct[0].clicks
      } : null
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Error loading dashboard");
  }
};

export const productListPage = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Convert Mongoose documents to plain objects for JSON serialization
    // Handle Map type units by converting to plain object
    const productsArray = products.map(p => {
      const productObj = p.toObject ? p.toObject() : p;
      // Convert Map to plain object if units is a Map
      if (productObj.units && productObj.units instanceof Map) {
        productObj.units = Object.fromEntries(productObj.units);
      }
      return productObj;
    });
    console.log('ProductListPage - Found', productsArray.length, 'products');
    res.render("admin/products", { products: productsArray });
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
    const { fullName, email, phone, bio } = req.body;
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
        role: "Administrator", // Default role, not changeable
        bio: bio || ""
      });
    } else {
      // Update existing admin (role and password cannot be changed from profile settings)
      if (fullName) admin.fullName = fullName;
      if (email !== undefined) admin.email = email;
      if (phone !== undefined) admin.phone = phone;
      // Role is not updated - it remains unchanged
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
    const productObj = product.toObject ? product.toObject() : product;
    
    // Convert Map to plain object if units is a Map
    if (productObj.units && productObj.units instanceof Map) {
      productObj.units = Object.fromEntries(productObj.units);
    }
    
    // Ensure all unit fields are arrays for consistent handling
    if (productObj.units) {
      for (const key in productObj.units) {
        if (productObj.units[key] && !Array.isArray(productObj.units[key])) {
          productObj.units[key] = [productObj.units[key]];
        }
      }
    }
    
    console.log('Edit product page - Product ID:', id);
    console.log('Product units:', JSON.stringify(productObj.units, null, 2));
    
    res.render("admin/add-product", {
      product: productObj,
      units: unitsData,
      isEdit: true,
      query: req.query
    });
  } catch (error) {
    console.error("Edit product page error:", error);
    res.status(500).send("Error loading edit page");
  }
};

export const updateProduct = async (req, res) => {
  try {
    console.log('=== Update Product Request ===');
    console.log('Product ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? req.files.map(f => f.filename) : 'No files');
    
    const { id } = req.params;
    const unitsPath = path.join(process.cwd(), "src/config/units.json");
    const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

    const { productName, description, imagesToRemove } = req.body;

    // Get existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }

    // Handle images - start with existing images
    let imagePaths = existingProduct.images || [];
    
    // Remove images that were marked for removal
    if (imagesToRemove) {
      try {
        const imagesToRemoveArray = JSON.parse(imagesToRemove);
        if (Array.isArray(imagesToRemoveArray)) {
          // Delete the image files from the server
          imagesToRemoveArray.forEach(imgPath => {
            const fullPath = path.join(process.cwd(), "src", "public", imgPath);
            if (fs.existsSync(fullPath)) {
              try {
                fs.unlinkSync(fullPath);
              } catch (err) {
                console.error(`Error deleting image ${imgPath}:`, err);
              }
            }
          });
          
          // Remove from imagePaths array
          imagePaths = imagePaths.filter(img => !imagesToRemoveArray.includes(img));
        }
      } catch (parseErr) {
        console.error("Error parsing imagesToRemove:", parseErr);
      }
    }
    
    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`);
      imagePaths = [...imagePaths, ...newImagePaths];
    }

    // Dynamic units - build from req.body (capture ALL unit fields)
    const selectedUnits = {};
    
    // Process all unit types from unitsData
    for (const unitKey in unitsData) {
      if (unitKey === 'industryList') {
        // Industry is a single select
        if (req.body[unitKey]) {
          selectedUnits[unitKey] = [req.body[unitKey]];
        }
      } else {
        // Multi-select checkboxes (sizeList, colorList, fragranceList, etc.)
        if (req.body[unitKey]) {
          const values = Array.isArray(req.body[unitKey])
            ? req.body[unitKey]
            : [req.body[unitKey]];
          // Filter out empty values
          const filteredValues = values.filter(val => val && val.trim() !== '');
          if (filteredValues.length > 0) {
            selectedUnits[unitKey] = filteredValues;
          }
        }
        // If not in req.body, it means nothing was selected, so don't include it
      }
    }

    // Also check for fragranceList specifically (it might be conditionally shown)
    if (req.body.fragranceList) {
      const fragranceValues = Array.isArray(req.body.fragranceList)
        ? req.body.fragranceList
        : [req.body.fragranceList];
      const filteredFragrance = fragranceValues.filter(val => val && val.trim() !== '');
      if (filteredFragrance.length > 0) {
        selectedUnits.fragranceList = filteredFragrance;
      }
    }

    // Update product - save ALL fields to database
    const updateData = {
      name: productName.trim(),
      description: description.trim(),
      images: imagePaths.length > 0 ? imagePaths : ["/uploads/default.png"],
      units: selectedUnits, // Mongoose will convert plain object to Map automatically
      featured: req.body.featured === 'on' || req.body.featured === true,
      topRated: req.body.topRated === 'on' || req.body.topRated === true,
      bestSeller: req.body.bestSeller === 'on' || req.body.bestSeller === true,
      onSale: req.body.onSale === 'on' || req.body.onSale === true,
      outofstock: req.body.outofstock === 'on' || req.body.outofstock === true,
      active: req.body.active === 'on' || req.body.active === true || req.body.active === undefined
      // Note: signature is not updated here, it's managed via toggle endpoint
    };

    console.log('Selected units:', JSON.stringify(selectedUnits, null, 2));
    console.log('Attempting to update product in database...');
    
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!updatedProduct) {
      console.error('Product not found with ID:', id);
      return res.status(404).send("Product not found");
    }

    console.log('✅ Product updated successfully in database:', updatedProduct._id);
    console.log('Updated product name:', updatedProduct.name);
    console.log('Updated product description:', updatedProduct.description);
    console.log('Updated product images:', updatedProduct.images);
    console.log('Updated product units:', Object.fromEntries(updatedProduct.units || new Map()));
    console.log('Updated product flags - featured:', updatedProduct.featured, 'topRated:', updatedProduct.topRated, 'bestSeller:', updatedProduct.bestSeller, 'onSale:', updatedProduct.onSale, 'outofstock:', updatedProduct.outofstock, 'active:', updatedProduct.active);

    res.redirect("/admin/products");
  } catch (err) {
    console.error("❌ Error updating product in database:", err);
    console.error("Error stack:", err.stack);
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

// Lead Management Controllers
export const leadListPage = async (req, res) => {
  try {
    // Auto-update lead statuses based on time
    const now = new Date();
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
    
    // Update contacted leads to in_progress if contacted more than 5 hours ago
    // Resolution must be done manually by admin
    await Lead.updateMany(
      { 
        status: 'contacted',
        contactedAt: { $exists: true, $lte: fiveHoursAgo }
      },
      { 
        $set: { 
          status: 'in_progress',
          inProgressAt: new Date()
        }
      }
    );

    const { status, subject, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter query
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (subject && subject !== 'all') {
      filter.subject = subject;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const leads = await Lead.find(filter)
      .sort(sortOptions)
      .limit(1000);

    // Get statistics for filters
    const statusCounts = {
      all: await Lead.countDocuments(),
      new: await Lead.countDocuments({ status: 'new' }),
      contacted: await Lead.countDocuments({ status: 'contacted' }),
      in_progress: await Lead.countDocuments({ status: 'in_progress' }),
      resolved: await Lead.countDocuments({ status: 'resolved' }),
      archived: await Lead.countDocuments({ status: 'archived' })
    };

    const subjectCounts = {
      all: await Lead.countDocuments(),
      general: await Lead.countDocuments({ subject: 'general' }),
      customer: await Lead.countDocuments({ subject: 'customer' }),
      order: await Lead.countDocuments({ subject: 'order' }),
      wholesale: await Lead.countDocuments({ subject: 'wholesale' })
    };

    res.render("admin/leads", {
      leads: leads || [],
      statusCounts,
      subjectCounts,
      currentFilters: {
        status: status || 'all',
        subject: subject || 'all',
        search: search || '',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error("Lead list page error:", error);
    res.status(500).send("Error loading leads");
  }
};

export const leadDetailPage = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).send("Lead not found");
    }

    res.render("admin/lead-detail", {
      lead: lead.toObject ? lead.toObject() : lead
    });
  } catch (error) {
    console.error("Lead detail page error:", error);
    res.status(500).send("Error loading lead details");
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = { status };
    const now = new Date();
    
    // Set timestamps based on status
    if (status === 'contacted') {
      updateData.contactedAt = now;
      // Clear in_progress timestamp if moving back to contacted
      updateData.inProgressAt = null;
    } else if (status === 'in_progress') {
      updateData.inProgressAt = now;
      // Ensure contactedAt is set if not already
      const lead = await Lead.findById(id);
      if (lead && !lead.contactedAt) {
        updateData.contactedAt = now;
      }
    } else if (status === 'resolved') {
      updateData.resolvedAt = now;
      // Ensure previous timestamps are set
      const lead = await Lead.findById(id);
      if (lead) {
        if (!lead.contactedAt) updateData.contactedAt = now;
        if (!lead.inProgressAt) updateData.inProgressAt = now;
      }
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.json({ success: true, message: "Lead status updated successfully", lead });
  } catch (error) {
    console.error("Update lead status error:", error);
    res.status(500).json({ success: false, message: "Error updating lead status" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({ success: false, message: "Error deleting lead" });
  }
};

// Product Enquiries Controllers
export const productEnquiriesPage = async (req, res) => {
  try {
    const { search, sortBy = 'clicks', sortOrder = 'desc' } = req.query;
    
    // Aggregate enquiries by product
    let matchStage = {};
    if (search) {
      matchStage.productName = { $regex: search, $options: 'i' };
    }

    const enquiries = await ProductEnquiry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            productId: "$productId",
            productName: "$productName"
          },
          clicks: { $sum: 1 },
          productId: { $first: "$productId" },
          productName: { $first: "$productName" },
          industry: { $first: "$industry" },
          lastClicked: { $max: "$clickedAt" }
        }
      },
      {
        $sort: sortBy === 'name' 
          ? { productName: sortOrder === 'asc' ? 1 : -1 }
          : { clicks: sortOrder === 'asc' ? 1 : -1 }
      }
    ]);

    res.render("admin/product-enquiries", {
      enquiries: enquiries || [],
      currentFilters: {
        search: search || '',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error("Product enquiries page error:", error);
    res.status(500).send("Error loading product enquiries");
  }
};