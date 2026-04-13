# STRUCTURE.md — Directory Structure

## Root Layout

```
claudeweb/
├── index.html              # Main public website (single file, all styles inline)
├── admin.html              # Admin CMS panel (single file, all styles inline)
├── server.js               # Express backend + CMS API (ES5, Node 10 compatible)
├── serve.mjs               # Lightweight static dev server (ESM)
├── screenshot.mjs          # Puppeteer screenshot utility (dev only)
├── package.json            # Dependencies, engines: node >=10
├── CLAUDE.md               # AI assistant instructions
├── .gitignore              # Excludes: node_modules/, data/, temporary screenshots/, etc.
│
├── brand_assets/           # Client brand images and documents (committed)
│   ├── technocon_logo_transparent.png
│   ├── technocon_logo_white_back.png
│   ├── CHIREN PRES-1.jpeg  # Project photos
│   ├── CHIREN PRES-2.jpeg
│   ├── CHIREN PRES-3.jpeg
│   ├── DJI_0005.JPG
│   ├── DJI_0012.JPG
│   └── *.pdf / *.docx      # Business card, guidelines, project PDF
│
├── data/                   # Runtime JSON data (gitignored, created by server.js)
│   ├── users.json          # Admin users with bcrypt hashes
│   ├── content.json        # Bilingual CMS text content
│   └── projects.json       # Project records with translations + image metadata
│
├── uploads/                # User-uploaded project images (gitignored)
│
├── node_modules/           # npm dependencies (gitignored)
│
├── temporary screenshots/  # Puppeteer screenshots (gitignored)
│
└── .planning/              # GSD project planning (this directory)
    └── codebase/           # Codebase map documents
```

## Key File Descriptions

| File | Size | Description |
|------|------|-------------|
| `index.html` | ~80KB | Entire website — HTML, CSS, JS, all inline. Tailwind CDN. |
| `admin.html` | ~30KB | Admin SPA — login, content editor, project manager, image upload |
| `server.js` | ~26KB | Express CMS — routes, auth, CRUD, JSON store, path middleware |
| `serve.mjs` | ~1.3KB | Static http server for dev (no API, just serves files) |
| `screenshot.mjs` | ~2KB | Puppeteer wrapper — saves to `temporary screenshots/` |

## `index.html` Internal Structure

Sections (in order):
1. `<head>` — meta, Tailwind CDN, Google Fonts, all CSS styles
2. `<nav>` — sticky transparent header with logo + language toggle
3. `#hero` — full-screen hero with background image
4. `#services` — services grid + QR tracking system + strengths
5. `#certificates` — ISO/compliance certifications list
6. `#strategic-partners` — infinite auto-scroll logo marquee
7. `#projects` — Gallery4 horizontal card carousel with expandable detail panels
8. `#about` — company info, capabilities, image stack
9. `#contact` — contact info + form
10. `<footer>` — brand, links
11. `<script>` — CMS fetch, carousel logic, filter/toggle, form handler

## `admin.html` Internal Structure

Tabs/sections:
- Login screen
- Content tab — edit bilingual text fields with `data-ck` key mapping
- Projects tab — list/create/edit/delete projects with bilingual fields
- Images tab — upload/delete per-project images
- Settings tab — change admin password

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| CSS classes (custom) | kebab-case, semantic prefixes | `.proj-card-g`, `.pgn-btn`, `.pgdot` |
| JS functions | camelCase | `filterProjects()`, `galleryScroll()`, `toggleProject()` |
| CMS content keys | dot-notation | `hero.tag`, `contact.email1`, `stat.1.n` |
| Project keys | kebab-case | `checkpoint`, `balkan`, `enefit` |
| API endpoints | REST | `/api/projects/:id` |
| Brand asset files | Original client filenames | `CHIREN PRES-1.jpeg` |
