import Admin from "../models/admin.js";

export const addAdminData = async (req, res, next) => {
  try {
    // Since login is now hardcoded, req.user is just { username: 'ArjanAttarsAdmin' }
    // Try to find admin by username from database (for profile data)
    if (req.isAuthenticated() && req.user) {
      const username = req.user.username || "ArjanAttarsAdmin";
      const admin = await Admin.findOne({ username });
      if (admin) {
        res.locals.admin = admin;
      } else {
        // If admin doesn't exist in DB, create a default one for profile display
        try {
          const defaultAdmin = new Admin({
            username: "ArjanAttarsAdmin",
            password: "addingproducts200",
            fullName: "Admin User",
            email: "",
            phone: "",
            role: "Administrator",
            bio: ""
          });
          await defaultAdmin.save();
          res.locals.admin = defaultAdmin;
        } catch (createError) {
          // If creation fails, just use null
          res.locals.admin = null;
        }
      }
    } else {
      // If not authenticated, try to get default admin
      const admin = await Admin.findOne({ username: "ArjanAttarsAdmin" });
      if (admin) {
        res.locals.admin = admin;
      } else {
        res.locals.admin = null;
      }
    }
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.locals.admin = null;
  }
  next();
};

