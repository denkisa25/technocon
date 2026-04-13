# ARCHITECTURE.md — System Architecture

## Pattern

**Monolithic server-rendered static site with a headless CMS backend.**

- `index.html` is a fully self-contained marketing/portfolio website with static fallback data
- `server.js` is a lightweight Express CMS that hydrates the frontend at runtime via REST API
- `admin.html` is a single-page admin panel for content management
- There is no build step, no bundler, no framework

## Layers

```
┌─────────────────────────────────────────────────┐
│  Browser                                        │
│  index.html  ←→  /api/content + /api/projects   │
│  admin.html  ←→  /api/* (all CMS endpoints)     │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (Express)
┌──────────────────▼──────────────────────────────┐
│  server.js (Express on Node.js)                 │
│  • Auth middleware (express-session)             │
│  • Subdirectory prefix stripping middleware      │
│  • REST API routes (/api/*)                      │
│  • Static file serving (uploads/, brand_assets/) │
└──────────────────┬──────────────────────────────┘
                   │ fs.readFileSync / writeFileSync
┌──────────────────▼──────────────────────────────┐
│  data/ (JSON files — gitignored)                │
│  users.json  content.json  projects.json         │
└─────────────────────────────────────────────────┘
```

## Entry Points

| Entry | Path | Description |
|-------|------|-------------|
| Production app | `server.js` | Express server — serves everything |
| Dev static server | `serve.mjs` | Lightweight http server for `index.html` only |
| Public website | `GET /` → `index.html` | Main marketing site |
| Admin panel | `GET /admin` → `admin.html` | CMS admin UI |

## Data Flow

### Public Page Load
1. Browser requests `GET /` → Express serves `index.html`
2. `index.html` JS calls `GET /api/content?lang=en` and `GET /api/projects?lang=en`
3. API returns JSON; JS binds values to `[data-ck]` elements and rebuilds project cards
4. If API fails (static hosting / network error), `PROJECTS_STATIC` fallback data is used

### CMS Admin Flow
1. Admin navigates to `/admin` → Express serves `admin.html`
2. `admin.html` JS detects `BASE` from `window.location.pathname` (handles `/temp/` prefix)
3. All fetch calls use `BASE + '/api/...'` to work at any subdirectory
4. Login → session cookie → protected endpoints unlocked

### Image Upload Flow
1. Admin POSTs multipart form to `/api/projects/:id/images`
2. Multer saves files to `uploads/` with timestamped filename
3. Image record written to `data/projects.json` with `filename: 'uploads/...'`
4. Frontend reads `images[]` array from `/api/projects` response

## Subdirectory Hosting Middleware

Critical pattern in `server.js:179-188` — strips the `/temp/` prefix that cPanel/Passenger
forwards as part of the request path:

```js
var KNOWN_PREFIXES = ['api', 'uploads', 'brand_assets', 'admin'];
app.use(function(req, res, next) {
  var parts = req.path.split('/').filter(Boolean);
  if (parts.length > 0 && KNOWN_PREFIXES.indexOf(parts[0]) === -1) {
    var stripped = '/' + parts.slice(1).join('/');
    req.url = (stripped === '/' ? '/' : stripped) + ...querystring;
  }
  next();
});
```

## Frontend CMS Binding

`index.html` uses `data-ck` attribute as binding key:

```html
<p class="hero-tag" data-ck="hero.tag">Energy & Industrial Infrastructure</p>
```

`fetchCMS(lang)` in `index.html` fetches content and sets `textContent` on each `[data-ck]` element.

## Static Fallback

`PROJECTS_STATIC` object in `index.html` contains hardcoded project data.
Used when `/api/projects` is unreachable (e.g. static file hosting without Node.js).
Ensures the page renders correctly even without the CMS backend.

## Bilingual Support

Both `index.html` and `admin.html` support EN/BG languages:
- Content stored as `{ en: {...}, bg: {...} }` in `data/content.json`
- Projects store translations in `translations: { en: {...}, bg: {...} }` per project
- `fetchCMS(lang)` called on language toggle button click
