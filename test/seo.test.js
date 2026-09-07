import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import ejs from 'ejs';
import fs from 'node:fs';
import { once } from 'node:events';
import { buildSeoDocuments, catalogSchema, jsonForHtml, productImages, productPath, robotsText } from '../src/services/seoService.js';
import { sitemapRouter } from '../src/routes/sitemapRoutes.js';
import adminRouter from '../src/routes/adminRoutes.js';
import Product from '../src/models/product.js';
import Admin from '../src/models/admin.js';

const base = 'https://arjanmalattarchand.com';
const product = { _id: '123456789012345678901234', name: 'Bottle </script><script>alert(1)</script>', description: 'Glass & gold <b>100 ml</b>', images: ['/uploads/a.jpg?x=1&y=2', 'https://cdn.example.com/b.jpg', 'javascript:alert(1)'], units: { sizeList: ['100 ml'] }, updatedAt: new Date('2025-01-02'), active: true };

test('sitemap uses canonical product pages, escaped image URLs and real dates', () => {
  const docs = buildSeoDocuments([product], base);
  assert.equal(docs.summary.urlCount, 7);
  assert.equal(docs.summary.imageCount, 2);
  assert.match(docs.sitemap, /2025-01-02T00:00:00.000Z/);
  assert.match(docs.sitemap, /x=1&amp;y=2/);
  assert.match(docs.sitemap, /\/products\/123456789012345678901234/);
  assert.doesNotMatch(docs.sitemap, /image:title|image:caption|industry=|\/admin|javascript:/);
  assert.equal((docs.sitemap.match(/<lastmod>/g) || []).length, 1);
  assert.match(docs.full, /Source: https:\/\/arjanmalattarchand.com\/products\//);
  assert.doesNotMatch(docs.full, /epoxy|1 kg|Model #001/);
});

test('all catalog products are represented without incomplete offers', () => {
  const products = Array.from({ length: 33 }, (_, i) => ({ ...product, _id: String(i) }));
  const list = catalogSchema(products, base)['@graph'][1];
  assert.equal(list.numberOfItems, 33);
  assert.equal(list.itemListElement.length, 33);
  assert.ok(list.itemListElement.every(x => !x.item.offers));
  const serialized = jsonForHtml(list);
  assert.doesNotMatch(serialized, /<\/script>/i);
  assert.deepEqual(JSON.parse(serialized), list);
});

test('image URLs normalize, deduplicate and exclude unsafe protocols', () => {
  assert.deepEqual(productImages({ images: ['/uploads/a.jpg', '/uploads/a.jpg', 'data:text/html,bad', '//cdn.example.com/a.jpg'] }, base), [base + '/uploads/a.jpg', 'https://cdn.example.com/a.jpg']);
  assert.throws(() => buildSeoDocuments([{ ...product, images: Array.from({ length: 1001 }, (_, i) => `/uploads/${i}.jpg`) }], base), /1,000 images/);
});

test('every crawler group excludes private endpoints', () => {
  const groups = robotsText(base).split('User-agent: ').slice(1);
  assert.equal(groups.length, 7);
  for (const group of groups) {
    assert.match(group, /Disallow: \/admin/);
    assert.match(group, /Disallow: \/api\//);
  }
});

test('public templates render parseable JSON-LD with hostile product text', async () => {
  const seo = JSON.parse(fs.readFileSync('src/config/seo.json', 'utf8'));
  const helpers = { jsonForHtml, catalogSchema, productImages, productPath };
  for (const name of ['index', 'about', 'contact', 'shop', 'product']) {
    const locals = { ...helpers, seoData: seo[name === 'index' ? 'home' : name] || {}, baseUrl: base,
      products: [product], signatureProducts: [], units: {}, selectedIndustry: 'All', product,
      canonical: base + productPath(product), schema: catalogSchema([product], base), images: productImages(product, base), enquiryUrl: 'https://wa.me/919811555255' };
    const html = await ejs.renderFile(`src/views/${name}.ejs`, locals);
    const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(matches.length, 1, name);
    assert.ok(JSON.parse(matches[0][1])['@graph'], name);
  }
});

test('generation routes enforce authentication and CSRF and fail honestly on database errors', async () => {
  const originalFind = Product.find;
  const originalAdminFind = Admin.findOne;
  Product.find = () => ({ sort: () => ({ lean: async () => [product] }) });
  Admin.findOne = async () => null;
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    // Isolated test server only. The application continues to use Passport.
    req.isAuthenticated = () => req.headers['x-test-auth'] === 'yes';
    req.session = { seoCsrf: 'test-token' };
    next();
  });
  app.use(sitemapRouter);
  app.use(adminRouter);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const root = `http://127.0.0.1:${server.address().port}`;
  try {
    const anonymous = await fetch(root + '/admin/seo/generate', { method: 'POST', redirect: 'manual' });
    assert.equal(anonymous.status, 302);
    assert.match(anonymous.headers.get('x-robots-tag'), /noindex/);
    const forbidden = await fetch(root + '/admin/seo/generate', { method: 'POST', headers: { 'x-test-auth': 'yes' } });
    assert.equal(forbidden.status, 403);
    const generated = await fetch(root + '/admin/seo/generate', { method: 'POST', headers: { 'x-test-auth': 'yes', 'Content-Type': 'application/json' }, body: JSON.stringify({ csrfToken: 'test-token' }) });
    assert.equal(generated.status, 200);
    assert.equal((await generated.json()).imageCount, 2);
    for (const path of ['/sitemap.xml', '/llms.txt', '/llms-full.txt', '/robots.txt']) {
      const response = await fetch(root + path);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /charset=utf-8/);
    }
    Product.find = () => { throw new Error('Simulated database outage'); };
    const failed = await fetch(root + '/sitemap.xml');
    assert.equal(failed.status, 503);
    assert.equal(failed.headers.get('cache-control'), 'no-store');
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    Product.find = originalFind;
    Admin.findOne = originalAdminFind;
  }
});
