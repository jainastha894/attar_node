import passport from "passport";

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
export const adminLogin = passport.authenticate("local",{
  successRedirect: "/admin/dashboard",
  failureRedirect: "/admin",
  failureFlash: true
});
export const adminLogout = (req, res) => {
  req.logout(() => {
    res.redirect("/admin");
  });
};