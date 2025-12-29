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
  adminLogout
} from "../controllers/adminPageController.js";
import { isAdminAuth } from "../middleware/isAdminAuth.js";

const router = express.Router();

router.get("/admin", loginPage);
router.get("/admin/logout",adminLogout );
router.post("/admin/login", adminLogin);

router.get("/admin/dashboard",isAdminAuth, dashboardPage);
router.get("/admin/products", isAdminAuth, productListPage);
router.get("/admin/products/add", isAdminAuth, addProductPage);
router.get("/admin/units",isAdminAuth,  unitsPage);
router.get("/admin/profile", isAdminAuth, profilePage);
router.get("/admin/profileSetting",isAdminAuth,  profileSettingsPage);


export default router;
