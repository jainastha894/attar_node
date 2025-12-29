import passport from "passport";
import fs from "fs";
import path from "path";

export const unitsPage = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));
    res.render("admin/units", {
    units: unitsData
  });
};

export const addUnit = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

  const { unitType, newUnit } = req.body;

  if (unitsData[unitType]) {
    unitsData[unitType].push(newUnit);
  }

  fs.writeFileSync(unitsPath, JSON.stringify(unitsData, null, 2));
  res.redirect("/admin/units");
};

export const removeUnit = (req, res) => {
  const unitsPath = path.join(process.cwd(), "src/config/units.json");
  const unitsData = JSON.parse(fs.readFileSync(unitsPath, "utf-8"));

  const { unitType, value } = req.body;

  if (!unitType || !value || !unitsData[unitType]) {
    return res.redirect("/admin/units");
  }

  // remove value
  unitsData[unitType] = unitsData[unitType].filter(
    item => item !== value
  );

  fs.writeFileSync(unitsPath, JSON.stringify(unitsData, null, 2));

  res.redirect("/admin/units");
};

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

export const profilePage = (req, res) => {
  res.render("admin/profile");
};
export const profileSettingsPage = (req, res) => {
  res.render("admin/profileSetting");
};
export const adminLogin = passport.authenticate("local",{
  successRedirect: "/administrator",
  failureRedirect: "/admin",
  failureFlash: true
});
export const adminLogout = (req, res) => {
  req.logout(() => {
    res.redirect("/admin");
  });
};