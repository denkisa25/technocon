# TESTING.md — Testing

## Current State

**No automated tests exist.** There is no test framework, no test files, no CI pipeline.

Testing is entirely manual:
1. Start dev server: `node serve.mjs` (static) or `node server.js` (with CMS)
2. Open browser at `http://localhost:3000`
3. Take screenshots: `node screenshot.mjs http://localhost:3000`
4. Visually compare against reference designs

## Screenshot Workflow (Puppeteer)

`screenshot.mjs` provides a semi-automated visual verification tool:

```bash
node screenshot.mjs http://localhost:3000           # → screenshot-N.png
node screenshot.mjs http://localhost:3000 label     # → screenshot-N-label.png
```

Saves to `temporary screenshots/` (gitignored). Auto-increments filename to avoid overwrites.

Can also inline Puppeteer for element-specific screenshots:
```js
const el = await page.$('#projects');
await el.screenshot({ path: 'temporary screenshots/screenshot-N-section.png' });
```

## Manual Test Checklist (Implicit)

Based on CLAUDE.md and development history, the implied test surface:

### Frontend
- [ ] Page renders correctly on localhost:3000
- [ ] All sections visible: hero, services, certificates, partners, projects, about, contact
- [ ] Gallery carousel: prev/next buttons, dot navigation, drag
- [ ] Project card click opens detail panel
- [ ] Filter buttons (All/Ongoing/Completed) show correct cards
- [ ] Language toggle (EN/BG) swaps content
- [ ] Contact form submit shows success state
- [ ] Mobile responsiveness (≤680px breakpoints)

### CMS API
- [ ] `GET /api/content?lang=en` returns content object
- [ ] `GET /api/projects?lang=en` returns project array
- [ ] Admin login / logout works
- [ ] Content edit persists to `data/content.json`
- [ ] Project CRUD persists to `data/projects.json`
- [ ] Image upload saves to `uploads/`

### Deployment
- [ ] App starts on cPanel with `node server.js`
- [ ] Subdirectory prefix `/temp/` handled correctly by middleware
- [ ] Admin panel accessible at `/temp/admin`
- [ ] API calls from `admin.html` use correct BASE path

## Recommended Future Testing

If tests are added, recommended approach:

- **API tests:** `node:test` (built-in, no deps) or `supertest` + `jest`
- **Visual regression:** Puppeteer + `pixelmatch` comparing screenshots
- **No unit tests needed** for current architecture (logic is thin CRUD)

## Known Testing Gaps

- Session expiry behaviour untested
- Image upload edge cases (too large, wrong type) only guarded by multer config
- Concurrent writes to JSON files would corrupt data (no locking)
- Subdirectory middleware has no test coverage
