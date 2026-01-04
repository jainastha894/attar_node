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
  updateProfile,
  removeProfilePic,
  changePassword,
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
  upload.array("productImages", 10),
  resizeImages,
  addProduct
);

router.post(
  "/admin/products/edit/:id",
  isAdminAuth,
  upload.array("productImages", 10),
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

export default router;
