# CONCERNS.md — Technical Concerns & Debt

## Critical

### 1. Hardcoded Admin Credentials in Source
**File:** `server.js:37`
```js
{ username: 'admin', password_hash: bcrypt.hashSync('technocon2026', 10) }
```
The default password `technocon2026` is seeded from source code and committed to git.
Anyone with repo access knows the default admin password.

**Risk:** High if repo is public or shared. Admin must change password after first login.
**Fix:** Seed from environment variable or prompt on first run, or at minimum document this clearly.

### 2. Hardcoded Session Secret
**File:** `server.js:149`
```js
secret: 'technocon-cms-2026-secret',
```
Static session secret in source. Sessions can be forged if attacker knows the secret.

**Fix:** Load from `process.env.SESSION_SECRET` with a random fallback.

### 3. No File Locking on JSON Store
Concurrent write requests (e.g. two admin tabs saving simultaneously) will cause a race condition — one write will overwrite the other. `fs.writeFileSync` is synchronous but two requests can interleave in the event loop.

**Risk:** Low in practice (single admin user, low traffic). High if ever multi-user.
**Fix:** Use a mutex or move to SQLite/proper DB if concurrent usage grows.

## High Priority

### 4. Data Not in Git — No Backup Strategy
`data/` is gitignored. If the cPanel server fails or files are accidentally deleted, all CMS content and project data is lost.

**Fix:** Periodic backup of `data/` folder, or add data to git with a `.gitignore` exception.

### 5. Node 10 Constraint
The cPanel host runs Node 10.24.1 — EOL since April 2021. This blocks use of:
- `async/await` in server.js
- Modern npm packages requiring Node 12+
- Security patches for many dependencies

**Fix:** Upgrade hosting plan, use a VPS, or containerize with a modern Node version.

### 6. No HTTPS Enforcement
Server itself has no HTTPS redirect. Relies entirely on cPanel/Passenger to handle TLS.
If Passenger misconfiguration occurs, requests could be served over HTTP.

## Medium Priority

### 7. Contact Form — No Backend Handler
**File:** `index.html` — `submitForm()` function
```js
function submitForm(e) {
  e.preventDefault();
  // Only shows success message — no actual submission
}
```
The contact form visually "works" but sends no email and stores no data.

**Fix:** Wire to an email service (Resend, SendGrid) or at minimum a `/api/contact` route.

### 8. index.html is 80KB of Inline HTML+CSS+JS
All styles, scripts, and markup in one file. Difficult to maintain at this size. No separation of concerns.

**Workaround:** Acceptable for a marketing site. Would be a problem if complexity grows.

### 9. CMS Projects Data Duplicated Between server.js and index.html
Project data exists in two places:
- `server.js` seed data (written to `data/projects.json` on first run)
- `PROJECTS_STATIC` fallback in `index.html`

These can drift out of sync if projects are edited in the admin panel.

### 10. Image Paths in Projects Reference brand_assets/
Seeded project images reference `brand_assets/CHIREN PRES-1.jpeg` etc., but images uploaded via admin are stored in `uploads/`. Paths are mixed — some have spaces (brand_assets names), which can cause URL encoding issues.

## Low Priority

### 11. No Rate Limiting on Auth Endpoints
`POST /api/auth/login` has no brute-force protection. An attacker can try unlimited passwords.

**Fix:** Add `express-rate-limit` middleware on auth routes.

### 12. Multer Only Validates by Extension
```js
fileFilter: function(req, file, cb) {
  cb(null, /\.(jpe?g|png|webp|gif)$/i.test(file.originalname));
}
```
Extension check is bypassable. Should also validate MIME type and/or magic bytes.

### 13. screenshot.mjs Uses Puppeteer as Dev Dependency
Puppeteer is installed in `node_modules/` but not in `package.json`. It's a side-loaded dev tool. This means it's present locally but not on the cPanel server, which is correct — but it's fragile (could be npm-cleaned away).

### 14. Subdirectory Prefix Middleware is Fragile
The `KNOWN_PREFIXES` list in `server.js:178` must be manually maintained. Adding a new static directory or route prefix requires updating this array or requests will be misrouted.

## Won't Fix (By Design)

- **No build step** — intentional, keeps deployment simple
- **Single admin user** — sufficient for this use case
- **No test suite** — manual testing acceptable for this project scale
- **Flat JSON storage** — appropriate for the data volume and access patterns
