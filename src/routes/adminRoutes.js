import express from "express";
import {
  loginPage,
  dashboardPage,
  productListPage,
  addProductPage,
  unitsPage,
  profilePage,
  profileSettingsPage,
  adminLogin,
  adminLogout,
  addUnit,
  removeUnit,
  addProduct,
  catalogPage,
  editProductPage,
  updateProduct,
  deleteProduct,
  toggleActive,
  toggleStock,
  toggleSignature,
  updateProfile,
  removeProfilePic,
  changePassword,
  leadListPage,
  leadDetailPage,
  updateLeadStatus,
  deleteLead,
  productEnquiriesPage,
} from "../controllers/adminPageController.js";
import { isAdminAuth } from "../middleware/isAdminAuth.js";
import { addAdminData } from "../middleware/adminData.js";
import upload, { resizeImages } from "../middleware/upload.js";

const router = express.Router();

// Add admin data to all admin routes
router.use(addAdminData);

router.get("/admin", loginPage);
router.get("/admin/logout",adminLogout );
router.post("/admin/login", adminLogin);


router.get("/administrator",isAdminAuth, dashboardPage);
router.get("/admin/products", isAdminAuth, productListPage);
router.get("/admin/products/add", isAdminAuth, addProductPage);
router.get("/admin/products/edit/:id", isAdminAuth, editProductPage);
router.get("/admin/units",isAdminAuth,  unitsPage);
router.post("/admin/units/add", isAdminAuth, addUnit);
router.post("/admin/units/remove", isAdminAuth, removeUnit);
router.get("/admin/profile", isAdminAuth, profilePage);
router.get("/admin/profileSetting",isAdminAuth,  profileSettingsPage);
router.get("/admin/catalog", isAdminAuth, catalogPage);


router.post(
  "/admin/products/add",
  isAdminAuth,
  (req, res, next) => {
    upload.array("productImages", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send("File size too large. Maximum size is 10MB.");
        }
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).send("Only image files are allowed!");
        }
        return res.status(400).send("File upload error: " + err.message);
      }
      next();
    });
  },
  resizeImages,
  addProduct
);

router.post(
  "/admin/products/edit/:id",
  isAdminAuth,
  (req, res, next) => {
    upload.array("productImages", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).send("File size too large. Maximum size is 10MB.");
        }
        if (err.message === 'Only image files are allowed!') {
          return res.status(400).send("Only image files are allowed!");
        }
        return res.status(400).send("File upload error: " + err.message);
      }
      next();
    });
  },
  resizeImages,
  updateProduct
);

router.delete(
  "/admin/products/delete/:id",
  isAdminAuth,
  deleteProduct
);

router.patch(
  "/admin/products/toggle-active/:id",
  isAdminAuth,
  toggleActive
);

router.patch(
  "/admin/products/toggle-stock/:id",
  isAdminAuth,
  toggleStock
);

router.patch(
  "/admin/products/toggle-signature/:id",
  isAdminAuth,
  toggleSignature
);

// Profile routes
router.post(
  "/admin/profile/update",
  isAdminAuth,
  upload.single("profilePic"),
  resizeImages,
  updateProfile
);

router.post(
  "/admin/profile/remove-pic",
  isAdminAuth,
  removeProfilePic
);

router.post(
  "/admin/profile/change-password",
  isAdminAuth,
  changePassword
);

// Lead Management Routes
router.get("/admin/leads", isAdminAuth, leadListPage);
router.get("/admin/leads/:id", isAdminAuth, leadDetailPage);
router.patch("/admin/leads/:id/status", isAdminAuth, updateLeadStatus);
router.delete("/admin/leads/:id", isAdminAuth, deleteLead);

// Product Enquiries Route
router.get("/admin/product-enquiries", isAdminAuth, productEnquiriesPage);

export default router;
