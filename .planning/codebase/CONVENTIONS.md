# CONVENTIONS.md — Code Conventions

## Critical: Node 10 Compatibility (server.js)

`server.js` **must** remain ES5-compatible. The cPanel host runs Node 10.24.1 with no upgrade path.

**Forbidden in server.js:**
- Arrow functions: `() =>` → use `function() {}`
- `const` / `let` → use `var`
- Template literals: `` `${x}` `` → use `'string' + x`
- Destructuring: `const { a } = obj` → use `var a = obj.a`
- `async/await`, `Promise`, spread operator
- ES modules (`import`/`export`) → use `require()`

**Allowed in index.html / admin.html (browser JS):**
- Modern ES6+ (arrow functions, const/let, template literals, etc.)
- Browsers on the target audience are modern

## Server.js Patterns

### JSON Store Read/Write
```js
// Read with fallback
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { return fallback; }
}
// Write
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
```

### Route Handler Pattern
```js
app.get('/api/resource', function(req, res) {
  var data = readJSON(FILES.resource, []);
  res.json(data);
});

app.put('/api/resource/:id', requireAdmin, function(req, res) {
  var items = readJSON(FILES.resource, []);
  var idx = items.findIndex(function(x) { return x.id == req.params.id; });
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  // mutate items[idx]...
  writeJSON(FILES.resource, items);
  res.json({ ok: true });
});
```

### Auth Guard
```js
var requireAdmin = function(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'Unauthorized' });
};
```

## Frontend (index.html) Patterns

### CMS Content Binding
HTML elements use `data-ck` attributes as content keys:
```html
<span data-ck="stat.1.n">€11M+</span>
```
JS binds with: `el.textContent = contentObj[el.dataset.ck]`

### Static Fallback Pattern
`PROJECTS_STATIC` object provides hardcoded data when API is unreachable:
```js
var PROJECTS_STATIC = {
  checkpoint: { title: '...', imgs: [...], meta: [...], ... },
  // ...
};
```

### API Base Detection
Detects subdirectory hosting automatically:
```js
var segs = window.location.pathname.split('/').filter(Boolean);
// Strip filename segment if present
// Result: '' (root) or '/temp' (subdirectory)
var API_BASE = ...;
```

### Reveal Animations
Elements with `.reveal` class animate in on scroll via `IntersectionObserver`:
```js
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
```

## CSS Conventions

### Custom Properties (CSS Variables)
Defined in `:root` at top of `<style>`:
```css
:root {
  --blue: #0089CF;
  --amber: #C8890A;
  --white: #FFFFFF;
  --black: #0D1117;
  --surface2: #F0F4F8;
  --border: #E2E8F0;
  --grey2: #64748B;
}
```

### No Default Tailwind Color Palette
Custom brand colors only. Never use `indigo-*`, `blue-*`, `purple-*` defaults.

### Animation Rules
- Animate only `transform` and `opacity` — never `transition-all`
- Spring easing: `cubic-bezier(.16,1,.3,1)` or `cubic-bezier(.25,.8,.25,1)`

### Component CSS Prefix Pattern
Related styles grouped with shared prefix:
- `.proj-card-g` — project gallery card
- `.proj-card-g-overlay`, `.proj-card-g-body`, `.proj-card-g-title` — sub-elements
- `.pgn-btn` — gallery navigation button
- `.pgdot` — gallery dot indicator

## Admin Panel (admin.html) Patterns

### BASE Detection
```js
var p = window.location.pathname;
var i = p.indexOf('/admin');
var BASE = i > 0 ? p.slice(0, i) : '';
```
All API calls: `fetch(BASE + '/api/...')`

### Tab Navigation
Single-page with `data-tab` attributes and `showTab(name)` function.

### Form Submissions
All admin forms use `fetch()` with JSON body. Success/error shown inline via status `<div>`.
