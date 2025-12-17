import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRoutes from "./routes/pageRoutes.js";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", pageRoutes);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

export default app;