import express from "express";
import {  loginPage,
  dashboardPage,
  productListPage,
  addProductPage,
  unitsPage,
  profilePage,
  profileSettingsPage
} from "../controllers/adminPageController.js";

  const router = express.Router();

  router.get("/admin", loginPage);
  router.get("/admin/dashboard", dashboardPage);
  router.get("/admin/products", productListPage);
  router.get("/admin/products/add", addProductPage);
  router.get("/admin/units", unitsPage);
  router.get("/admin/profile", profilePage);
  router.get("/admin/profileSetting", profileSettingsPage);

export default router;
