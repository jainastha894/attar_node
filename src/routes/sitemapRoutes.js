import express from "express";

const router = express.Router();

// Static list of important URLs; extend as you add new pages
const baseUrl = process.env.BASE_URL || "https://arjanmalattarchand.com";
const urls = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/administrator", // admin dashboard (optional; remove if you don't want indexed)
];

router.get("/sitemap.xml", (_req, res) => {
  const lastmod = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.7"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.send(xml);
});

export { router as sitemapRouter };
