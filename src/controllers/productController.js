import Product from "../models/product";

export const getAllProducts = async () => {
  return await Product.find();
};