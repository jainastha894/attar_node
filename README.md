# Arjanmal Attarchand – Node/Express App

A small Express 5 + EJS application that powers the public marketing site and an admin backend for managing products, units, leads, and enquiries. MongoDB Atlas is used for persistence; sessions are stored in-memory (suitable for local/dev).

## Quick start
- `npm install`
- Copy `.env.example` to `.env` and fill values (see below).
- `npm run dev` (nodemon) or `npm start` (plain node) — server listens on `http://localhost:3000` by default.

## Environment variables
Create a `.env` in the project root:
```
MONGOURL=mongodb+srv://<user>:<password>@<cluster>/<database>
PORT=3000            # optional; defaults to 3000
```
> Do not commit real credentials. The repo’s current `.env` contains live values—rotate them if exposed.

## Useful routes
- Public pages: `/`, `/shop`, `/about`, `/contact`, `/privacy`, `/terms`
- Admin: `/admin` (login), `/administrator` (dashboard) and related product/unit/lead routes
- Media: `/uploads/:filename` (serves uploaded images with proper headers)
- Health check: `/healthz` returns JSON with DB connection status
- Error pages: friendly HTML 404/500; JSON variants automatically returned for `/api/*` or non-HTML requests

## Error & logging behavior
- Each request gets an `X-Request-ID`; IDs surface in 404/500 views and JSON responses.
- 404s: HTML render by default; JSON if API or non-HTML accept header.
- 500s: Central error handler logs details (method, path, request ID) and returns HTML or JSON with `Retry-After: 120`.

## Scripts
- `npm run dev` – start with nodemon
- `npm start` – start with node
- `npm run migrate` – run `src/scripts/migrateToDatabase.js`
- `npm run delete-enquiries` – purge product enquiries via script

## Tech stack
- Node.js (ESM), Express 5, EJS views, Tailwind CDN for public pages
- MongoDB via Mongoose
- Multer + Sharp for image uploads/resizing
- Passport local auth for admin login

## Development notes
- Static assets live in `src/public/`; EJS views in `src/views/`.
- Session secret is currently hard-coded in `src/app.js`; consider moving to an env var for production.
- In-memory sessions are fine for local use; swap to a store (Redis/Mongo) before deploying behind multiple instances.

## Testing
No automated tests yet. Suggested additions: supertest coverage for 404/500 HTML/JSON, auth guard behavior, and `/healthz`.
