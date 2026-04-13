# INTEGRATIONS.md — External Integrations

## CDN Dependencies (Frontend)

| Service | What | URL |
|---------|------|-----|
| Google Fonts | Barlow Condensed, Outfit, Inter | `https://fonts.googleapis.com` |
| Tailwind CSS | Utility CSS framework | `https://cdn.tailwindcss.com` |
| placehold.co | Placeholder images (dev/fallback) | `https://placehold.co/` |

All CDN dependencies are loaded client-side in `index.html`. No bundled/vendored copies.

## Authentication

- **Internal only** — bcryptjs password hashing, express-session cookie
- No OAuth, no SSO, no external auth provider
- Single admin user seeded from `server.js` on first run: `admin / technocon2026`

## File Storage

- **Local filesystem only** — uploads stored in `uploads/` directory on the server
- No S3, no CDN for uploaded images
- Brand assets served from `brand_assets/` (committed to git)

## Email / Notifications

- **None implemented** — contact form in `index.html` submits but only shows a client-side success message (no server-side handler, no SMTP)
- Contact emails displayed statically: `dcc@techno-con.eu`, `office@techno-con.eu`

## External APIs

- **None** — no third-party API calls from backend
- Frontend fetches only from own backend: `/api/content`, `/api/projects`

## Deployment Platform

| Platform | Role |
|---------|------|
| cPanel (shared hosting) | Production server |
| Phusion Passenger | Node.js process manager on cPanel |
| Git Version Control (cPanel) | Deploy via "Upload from Remote" (git pull) |
| Domain: `ochen-lekar.com/temp/` | Production URL |

## CMS API Endpoints (Self-Hosted)

All endpoints served by `server.js`:

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/content?lang=en` | Public | Fetch CMS text content |
| GET | `/api/content/all` | Admin | All content keys (admin panel) |
| PUT | `/api/content/:key` | Admin | Update a content key |
| GET | `/api/projects?lang=en` | Public | List all projects |
| GET | `/api/projects/:id` | Admin | Single project (raw) |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/images` | Admin | Upload images |
| DELETE | `/api/projects/:id/images/:imgId` | Admin | Delete image |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Admin | Logout |
| GET | `/api/auth/me` | Public | Check session |
| PUT | `/api/auth/password` | Admin | Change password |
