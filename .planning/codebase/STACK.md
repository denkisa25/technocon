# STACK.md — Technology Stack

## Runtime & Language

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | >=10.0.0 (constrained by cPanel host) |
| Backend language | JavaScript (ES5 — no arrow functions, no const/let) | CommonJS modules |
| Frontend language | HTML/CSS/JavaScript (vanilla, ES6 in browser) | Inline in `index.html` |
| Dev server | Node.js ESM (`serve.mjs`) | Native http module |
| Package manager | npm | — |

## Backend Framework & Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.3 | HTTP server, routing, static file serving |
| `express-session` | ^1.18.0 | Session management for admin auth |
| `multer` | ^1.4.5-lts.2 | Multipart file upload handling (project images) |
| `bcryptjs` | ^2.4.3 | Password hashing (pure JS, no native bindings) |

**No native modules** — all dependencies are pure JavaScript for Node 10 compatibility.

## Frontend Stack

- **CSS framework:** Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) — no build step
- **Fonts:** Google Fonts CDN — Barlow Condensed (headings), Inter/Outfit (body)
- **Icons/SVGs:** Inline SVG in HTML
- **Animations:** CSS keyframes + transitions (no JS animation library)
- **Language:** Vanilla JS — no React, Vue, or bundler

## Data Storage

| Store | Format | Location | Git status |
|-------|--------|----------|-----------|
| Users | JSON | `data/users.json` | gitignored |
| CMS content | JSON | `data/content.json` | gitignored |
| Projects | JSON | `data/projects.json` | gitignored |
| Uploaded images | Files | `uploads/` | gitignored |
| Brand assets | Files | `brand_assets/` | committed |

**No database** — flat JSON files via `fs.readFileSync`/`fs.writeFileSync`.

## Dev Tooling

| Tool | Purpose | Location |
|------|---------|---------|
| `serve.mjs` | Static dev server on port 3000 | `serve.mjs` |
| `screenshot.mjs` | Puppeteer screenshot utility | `screenshot.mjs` |
| Puppeteer | Headless Chrome (dev-only, not in package.json) | `node_modules/puppeteer` (installed separately) |

## Configuration

- **Port:** `process.env.PORT || 3000`
- **Session secret:** Hardcoded string in `server.js:148`
- **Upload size limit:** 15 MB per file, images only (jpeg/png/webp/gif)
- **Session TTL:** 8 hours

## Build / Deployment

- **No build step** — HTML is a single self-contained file
- **Production:** Phusion Passenger on cPanel, Node.js app hosted at `/temp/` subdirectory
- **Start command:** `node server.js` (also `npm start`)
- **Git repo:** Connected to cPanel via "Git Version Control" → Upload from Remote
