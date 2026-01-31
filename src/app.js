import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { passportConfig } from "./config/passportConfig.js";
import adminRoutes from "./routes/adminRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import { sitemapRouter } from "./routes/sitemapRoutes.js";
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const app = express();
const PORT = process.env.PORT || 3000;



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
connectDB();

//session config
app.use(
  session({
    name: "admin.sid",          // cookie name
    secret: "super-secret-key", // session sign key
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 60 * 6,   // 60 days *6
      minAge: 1000 * 60 * 60 * 24 * 60 * 6,  // 60 days *6

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON request bodies

// Attach a request id for tracing across logs and responses
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);
  next();
});

// Health check for uptime monitors and orchestrators
app.get("/healthz", async (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = states[mongoose.connection.readyState] || "unknown";
  const healthy = state === "connected";
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    dbState: state,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/", pageRoutes);
app.use(adminRoutes);
app.use(sitemapRouter);

// 404 handler (must stay after all other routes)
app.use((req, res) => {
  // Prefer HTML if the client accepts it, otherwise JSON for APIs
  const wantsJson = req.path.startsWith("/api") || req.accepts("json") && !req.accepts("html");
  if (!wantsJson && req.accepts("html")) {
    return res.status(404).render("404", { url: req.originalUrl, requestId: req.id });
  }
  return res.status(404).json({ error: "Not Found", path: req.originalUrl, requestId: req.id });
});

// Error handler for unexpected server errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", {
    id: req.id,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.setHeader("Retry-After", "120"); // hint clients to retry after 2 minutes

  const wantsJson = req.path.startsWith("/api") || req.accepts("json") && !req.accepts("html");
  if (!wantsJson && req.accepts("html")) {
    return res
      .status(500)
      .render("500", { message: "Something went wrong.", requestId: req.id });
  }
  return res.status(500).json({ error: "Internal Server Error", requestId: req.id });
});


app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

export default app;
