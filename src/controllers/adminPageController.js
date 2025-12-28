export const loginPage = (req, res) => {
  res.render("admin/login");
};

export const dashboardPage = (req, res) => {
  res.render("admin/dashboard");
};

export const productListPage = (req, res) => {
  res.render("admin/products");
};

export const addProductPage = (req, res) => {
  res.render("admin/add-product");
};

export const unitsPage = (req, res) => {
  res.render("admin/units");
};

export const profilePage = (req, res) => {
  res.render("admin/profile");
};
export const profileSettingsPage = (req, res) => {
  res.render("admin/profileSetting");
};