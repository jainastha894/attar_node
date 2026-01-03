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
router.get("/shop", renderShop);


export default router;
