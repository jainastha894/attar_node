import Product from '../models/product.js';

export function siteUrl() {
  const url = new URL(process.env.BASE_URL || 'https://arjanmalattarchand.com');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid BASE_URL');
  return url.origin;
}
export const jsonForHtml = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const productPath = product => `/products/${product._id}`;
export function imageUrl(value, base = siteUrl()) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value, `${base}/`);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export const productImages = (product, base = siteUrl()) => [...new Set((product.images || []).map(value => imageUrl(value, base)).filter(Boolean))];
export function productSchema(product, base = siteUrl()) {
  return {
    '@type': 'Product', '@id': `${base}${productPath(product)}#product`,
    name: product.name, description: product.description || product.name,
    url: `${base}${productPath(product)}`, image: productImages(product, base),
    brand: { '@type': 'Brand', name: 'Arjanmal Attarchand' },
    // Quotation-only catalog: no fabricated price, Offer, rating or review.
    additionalProperty: [{ '@type': 'PropertyValue', name: 'Stock status', value: product.outofstock ? 'Out of stock' : 'In stock' }]
  };
}
export function catalogSchema(products, base = siteUrl()) {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Wholesale Bottles Shop', item: `${base}/shop` }
    ] },
    { '@type': 'ItemList', name: 'Wholesale bottles catalog', numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, item: productSchema(product, base) })) }
  ] };
}
export function escapeXml(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/[<>&'\"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' }[c]));
}
const corePages = ['/', '/shop', '/about', '/contact', '/privacy', '/terms'];
const line = value => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
const md = value => line(value).replace(/[\\`*_[\]<>#]/g, '\\$&');
export function buildSeoDocuments(products, base = siteUrl()) {
  const entries = corePages.map(path => `<url><loc>${escapeXml(base + path)}</loc></url>`);
  let imageCount = 0;
  for (const product of products) {
    const images = productImages(product, base);
    if (images.length > 1000) throw new Error('A product exceeds the sitemap limit of 1,000 images');
    imageCount += images.length;
    const updated = product.updatedAt && new Date(product.updatedAt);
    const lastmod = updated && Number.isFinite(updated.getTime()) && updated <= new Date()
      ? `<lastmod>${updated.toISOString()}</lastmod>` : '';
    entries.push(`<url><loc>${escapeXml(base + productPath(product))}</loc>${lastmod}${images.map(url => `<image:image><image:loc>${escapeXml(url)}</image:loc></image:image>`).join('')}</url>`);
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>\n`;
  if (entries.length > 50000 || Buffer.byteLength(sitemap) > 50 * 1024 * 1024) throw new Error('Sitemap exceeds single-file limits; split into a sitemap index');
  const business = '# Arjanmal Attarchand\n\n> Wholesale bottles and packaging supplier in New Delhi, established in 1904.\n\n## Business details\n- Address: 772, Tilak Bazar, Khari Baoli, New Delhi, Delhi 110006, India\n- Phone / WhatsApp: +91 98115 55255\n- Heritage: Established in Lahore in 1904; now based in New Delhi.\n- Supply: Delhi NCR and pan-India. Contact the business to confirm export arrangements.\n';
  const links = `\n## Website\n- [Home](${base}/)\n- [Catalog](${base}/shop)\n- [Company history](${base}/about)\n- [Contact and location](${base}/contact)\n- [Full catalog reference](${base}/llms-full.txt)\n`;
  const terms = '\n## Wholesale enquiries\nPrices, minimum order quantities, carton quantities, finishes and delivery arrangements must be confirmed with the business for each item. Product sizes and materials below come from the current public catalog. Stock status can change.\n';
  const llms = business + links + terms + `\n## Active products\n${products.map(p => `- [${md(p.name)}](${base}${productPath(p)}): ${md(p.description)}`).join('\n')}\n`;
  const full = business + links + terms + '\n## Current catalog\n' + products.map(p => {
    const units = p.units instanceof Map ? Object.fromEntries(p.units) : p.units || {};
    return `\n### ${md(p.name)}\n- Source: ${base}${productPath(p)}\n- Description: ${md(p.description)}\n- Stock: ${p.outofstock ? 'Out of stock; enquire about restocking' : 'In stock; confirm quantity when ordering'}\n${Object.entries(units).filter(([, v]) => Array.isArray(v) && v.length).map(([key, values]) => `- ${md(key.replace(/List$/, '').replace(/([A-Z])/g, ' $1'))}: ${values.map(md).join(', ')}`).join('\n')}\n`;
  }).join('');
  return { sitemap, llms, full, summary: { generatedAt: new Date().toISOString(), productCount: products.length, urlCount: entries.length, imageCount, sitemapBytes: Buffer.byteLength(sitemap), baseUrl: base } };
}
export async function generateSeoDocuments() {
  const products = await Product.find({ active: true }).sort({ _id: 1 }).lean();
  return buildSeoDocuments(products);
}
export function robotsText(base = siteUrl()) {
  const agents = ['GPTBot', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', '*'];
  return '# Public catalog crawl rules. robots.txt does not replace authentication.\n' + agents.map(agent => `\nUser-agent: ${agent}\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /healthz\n`).join('') + `\nSitemap: ${base}/sitemap.xml\n# Catalog reference: ${base}/llms.txt\n`;
}
