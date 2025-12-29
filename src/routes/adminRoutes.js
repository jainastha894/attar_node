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
  removeUnit
} from "../controllers/adminPageController.js";
import { isAdminAuth } from "../middleware/isAdminAuth.js";

const router = express.Router();

router.get("/admin", loginPage);
router.get("/admin/logout",adminLogout );
router.post("/admin/login", adminLogin);


router.get("/administrator",isAdminAuth, dashboardPage);
router.get("/admin/products", isAdminAuth, productListPage);
router.get("/admin/products/add", isAdminAuth, addProductPage);
router.get("/admin/units",isAdminAuth,  unitsPage);
router.post("/admin/units/add", isAdminAuth, addUnit);
router.post("/admin/units/remove", isAdminAuth, removeUnit);
router.get("/admin/profile", isAdminAuth, profilePage);
router.get("/admin/profileSetting",isAdminAuth,  profileSettingsPage);


export default router;
