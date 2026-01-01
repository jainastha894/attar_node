import Product from "../models/product.js";


export const getAllProducts = async () => {
  return await Product.find();
};