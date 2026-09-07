# SEO dashboard upgrade — manual deployment

The changes are implemented and tested locally. Production has not been updated by this task.

## Deploy

1. Back up the current application files on the hosting server.
2. Upload the files from the release ZIP into the existing Node application directory, preserving their relative paths. Merge directories and overwrite the included files. Do not replace or delete the server's uploads directory: 20 current catalog images exist on the server but are absent from this checkout.
3. Keep the existing production `.env`, database configuration and uploaded files. No database migration or new dependency is required. The existing root `app.js` continues to load `src/app.js`; `npm start` also works.
4. Set `BASE_URL=https://arjanmalattarchand.com` in the hosting environment if it is not already set. That domain is also the default.
5. Restart the Node application using the hosting control panel. Clear any hosting/CDN cache for the HTML pages, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/llms-full.txt`.
6. Sign in at `/admin`, open `/administrator`, and click **Generate sitemap**. Confirm the success message and counts. At verification, there were 33 active products, 39 page URLs and 74 image entries; counts follow the current database.
7. Open the four public file links in the dashboard. They must return HTTP 200. Test a **View product details** link in the shop and confirm its photos load.
8. In the verified Google Search Console property for the domain, submit `https://arjanmalattarchand.com/sitemap.xml`. Generation does not submit to Search Console automatically. Validate public pages with Google's Rich Results Test and inspect indexing in Search Console after deployment.

## What changed

- The contact form has one **Send Message** button. It first saves the enquiry to admin leads, then opens a prefilled message to +91 98115 55255 with name, email, optional phone, subject and message. This also works when submitting with Enter. Visitors must tap Send in WhatsApp. The success screen includes a fallback WhatsApp link if popups are blocked. Upload `src/views/contact.ejs` and `src/public/js/contact-form.js` together.
- An authenticated, CSRF-protected dashboard action generates the sitemap and AI catalog and reports counts and errors. The last successful generation is shown for the current login session.
- Public XML and AI text endpoints query active catalog products on request. They precede static-file middleware, so old text copies cannot override the live output. No manual regeneration is required after changing a product.
- Every active product has a server-rendered `/products/:id` page with photos, details, canonical URL, breadcrumbs and a quotation link. Inactive/missing products return 404.
- Shop HTML includes crawlable product links before JavaScript runs, and retains them after filtering. All products are represented in the ItemList.
- Home, About, Contact, Shop and product JSON-LD parse correctly. Broken schema URLs, unsupported homepage category Product entries, fake search actions and incomplete price-less Offers were removed. Product text is serialized safely in JSON script elements.
- Image sitemap entries use the supported image URL tags and are attached to their actual product pages. Product modification dates come from the database; undated core pages omit lastmod. Noncanonical category filter URLs are excluded.
- All crawler groups exclude admin and API paths. Admin responses carry noindex and no-store headers.
- AI catalog files use current public catalog data and source links. Static fallback copies contain conservative business information. No invented prices, ratings, model specifications or ranking promises were added.
- LocalBusiness markup retains the existing address and phone and names Delhi NCR and India as service areas. Unverified coordinates were removed; confirm the actual showroom pin before adding coordinates.

## Verification

- `npm test`: 6 tests pass, covering all products, XML escaping, URL normalization, unsafe JSON text, template rendering, robots rules, authenticated generation/CSRF, and database failure responses.
- Clicked **Generate sitemap** through the local admin dashboard: success, 33 products / 39 URLs / 74 images.
- All 39 sitemap page URLs returned HTTP 200 locally. All 37 JSON-LD blocks on those pages parsed successfully; privacy and terms have no JSON-LD.
- All 74 images are accounted for: 54 exist in this checkout; the remaining 20 returned HTTP 200 with distinct JPEG metadata on production.
- Quotation-only Product markup is descriptive and does not claim eligibility for Google's price-based product rich results. Google does not guarantee indexing or AI citations.

## Official references

- [Google image sitemap requirements](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Sitemap dates and canonical URLs](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google product structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)

## Rollback

Restore the backed-up application files and restart Node. This upgrade does not migrate or modify catalog records. Keep production uploads intact during rollback as well.
