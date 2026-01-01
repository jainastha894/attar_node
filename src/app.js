import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRoutes from "./routes/pageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { passportConfig } from "./config/passportConfig.js";

const app = express();
const PORT = process.env.PORT || 3000;


dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

try {
  await mongoose.connect(process.env.MONGOURL);
  console.log("MongoDB connected");
} catch (err) {
  console.error("MongoDB connection failed:", err.message);
  process.exit(1);
}

//session config
app.use(
  session({
    name: "admin.sid",          // cookie name
    secret: "super-secret-key", // session sign key
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 60   // 60 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passportConfig();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", pageRoutes);
app.use(adminRoutes);


app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

export default app;