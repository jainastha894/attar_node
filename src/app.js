import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRoutes from "./routes/pageRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", pageRoutes);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
