import express from "express";
import {
  renderHome,
  renderAbout,
  renderContact,
  renderShop
} from "../controllers/pageController.js";
import { getAllProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", renderHome);
router.get("/about", renderAbout);
router.get("/contact", renderContact);
router.get("/shop", async (req, res) => {
  const products = await getAllProducts();
  res.render("shop", { products });
});

export default router;
