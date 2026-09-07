import express from 'express';
import { generateSeoDocuments, robotsText } from '../services/seoService.js';
const router = express.Router();
router.get('/robots.txt', (_req, res) => res.type('text/plain').set('Cache-Control', 'no-cache').send(robotsText()));
for (const [path, key, contentType] of [
  ['/sitemap.xml', 'sitemap', 'application/xml'],
  ['/llms.txt', 'llms', 'text/plain'],
  ['/llms-full.txt', 'full', 'text/plain']
]) {
  router.get(path, async (_req, res) => {
    try {
      const documents = await generateSeoDocuments();
      res.type(contentType).set('Cache-Control', 'no-cache').send(documents[key]);
    } catch (error) {
      console.error('SEO generation failed:', error.message);
      res.status(503).set('Retry-After', '120').set('Cache-Control', 'no-store').type('text/plain').send('Catalog temporarily unavailable. Please retry shortly.');
    }
  });
}
export { router as sitemapRouter };
