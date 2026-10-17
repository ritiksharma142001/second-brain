# Second Brain

A blogging platform for capturing ideas and sharing knowledge, with a travel focus. Readers can search by keyword, category and tag; signed-in users write and publish their own posts, upload photos, comment, bookmark and keep a reading history.

This file is the single source of documentation: what the project is, what changed, how to run it, what it needs, and how to test it.

---

## Contents

1. [Tech stack](#1-tech-stack)
2. [Database requirements](#2-database-requirements)
3. [How to start the server](#3-how-to-start-the-server)
4. [Environment variables](#4-environment-variables)
5. [Running the tests](#5-running-the-tests)
6. [What has been built and changed](#6-what-has-been-built-and-changed)
7. [Project structure](#7-project-structure)
8. [Before going live](#8-before-going-live)
9. [Known limitations](#9-known-limitations)
10. [Continuing with Claude Code](#10-continuing-with-claude-code)

---

## 1. Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI primitives, lucide-react icons |
| Fonts | Space Grotesk (headings), Inter (body), Space Mono (labels), loaded with `next/font` |
| Database | PostgreSQL with Prisma 6 ORM |
| Authentication | NextAuth.js v5 (beta): email + password (bcrypt), optional Google sign-in, JWT sessions |
| Rich-text editor | Tiptap 2 (headings, tables, task lists, code blocks, images, links) |
| Images | `sharp` (resize, convert to WebP, strip metadata), stored on local disk |
| Validation | Zod |
| Security | `sanitize-html` for post content, `rate-limiter-flexible` for rate limiting, security headers in `next.config.ts` |
| Testing | Vitest (unit tests), TypeScript compiler, ESLint |
| Deployment | Docker (multi-stage image) and Docker Compose |

Requires **Node.js 20.9 or newer** (developed on Node 22).

---

## 2. Database requirements

**PostgreSQL is required.** No other database is supported (the Prisma schema uses the `postgresql` provider).

- **Version:** PostgreSQL 14 or newer. Developed against PostgreSQL 18; the Docker Compose file uses PostgreSQL 16.
- **Privileges:** the database user needs to create tables and indexes in its own database. `CREATEDB` is only needed if you run `prisma migrate dev`.
- **Connection string:** set `DATABASE_URL` (see [environment variables](#4-environment-variables)).
- **Tables (15):** `User`, `Account`, `Session`, `VerificationToken`, `Category`, `Tag`, `Post`, `Comment`, `CommentLike`, `Bookmark`, `ViewHistory`, `Media`, `Newsletter`, `Notification`, `Announcement`.
- **Schema management:** versioned migrations live in `prisma/migrations`. Use `npm run db:migrate` (`prisma migrate deploy`) to apply them. Do **not** use `prisma db push` on a database that holds real data: it can drop data to make the schema match.
- **Case-insensitive search** uses Postgres `ILIKE` through Prisma (`mode: "insensitive"`); no extensions are required.

### Create a local database

```bash
sudo -u postgres psql -c "CREATE USER secondbrain WITH PASSWORD 'secondbrain' CREATEDB;" \
                      -c "CREATE DATABASE secondbrain OWNER secondbrain;"
```

Use a stronger password outside your own machine.

---

## 3. How to start the server

### Local development

```bash
# 1. Install dependencies (the flag is needed because of a peer-dependency conflict)
npm install --legacy-peer-deps

# 2. Create your environment file and fill it in
cp .env.example .env
#    - set DATABASE_URL
#    - generate a secret:  openssl rand -base64 32   (use it for AUTH_SECRET and NEXTAUTH_SECRET)

# 3. Create the tables
npm run db:migrate

# 4. Load starter data (optional but recommended)
npm run db:seed          # categories (incl. Travel), demo users, 2 sample posts
npm run db:seed:posts    # 20 more sample posts (safe to re-run; skips existing ones)

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

**Demo accounts** created by the seed (change these before going live):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin@12345` |
| User | `user@example.com` | `Admin@12345` |

Set `ADMIN_PASSWORD` before running the seed to choose a different password. You can also just create an account at `/auth/signup`.

**Useful pages:** `/` home, `/blog`, `/search`, `/auth/signin`, `/auth/signup`, `/dashboard` (your area), `/admin` (admins only), `/api/health` (health check).

### Production build (without Docker)

```bash
npm run build
npm run db:migrate
npm start
```

### Docker

```bash
# set POSTGRES_PASSWORD, AUTH_SECRET and NEXTAUTH_URL in your shell or a .env file, then:
docker compose up -d --build
docker compose --profile tools run --rm migrate    # applies database migrations
```

The compose file starts PostgreSQL (not exposed to the host) and the app on port 3000, with a named volume for uploaded images. *The Docker setup has not been run end-to-end in the development environment, so test it once on your target host.*

### Handy commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` / `npm start` | Production build / production server |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run type-check` | TypeScript check, no output files |
| `npm run format` | Prettier |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:seed` / `npm run db:seed:posts` | Starter data / 20 sample posts |
| `npm run db:studio` | Browse the database in Prisma Studio |

> **Tip:** run only one `next dev` per project folder, and avoid running `next build` while the dev server is running on a low-memory machine. The dev server can use around 2.5 GB of RAM.

---

## 4. Environment variables

Copy `.env.example` to `.env`. The app validates the important ones on startup and refuses to start in production if they are missing.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/secondbrain` |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | yes | Secret for signing sessions (at least 16 characters; generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | yes in production | Public URL of the site |
| `AUTH_TRUST_HOST` | when behind a proxy | Set to `true` |
| `NEXT_PUBLIC_SITE_URL` | yes in production | Used for links, sitemap, RSS and share links |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED` | optional | Turn on "Continue with Google" (set the last one to `"true"`) |
| `UPLOAD_DIR` | optional | Folder for uploaded images (default `./uploads`). Use a persistent volume in production |
| `ADMIN_PASSWORD` | optional | Password the seed gives to the demo accounts |

---

## 5. Running the tests

```bash
npm test               # all unit tests (Vitest), about 35 tests in 7 files
npm run type-check     # TypeScript
npm run lint           # ESLint (0 errors; a few warnings remain)
```

To run a single file: `npx vitest run src/lib/search.test.ts`. To re-run on every change: `npx vitest`.

**What the tests cover** (`src/**/*.test.ts`, no database or server needed):

| File | Covers |
|---|---|
| `lib/security.test.ts` | HTML sanitiser: strips scripts, event handlers, `javascript:` links, iframes |
| `lib/validations/auth.test.ts` | Sign-up and login rules (email cleanup, password length) |
| `lib/rate-limit.test.ts` | Rate limiter blocking, retry time, reset and independent keys |
| `lib/avatars.test.ts` | Only DiceBear avatar URLs in the expected format are accepted |
| `lib/search.test.ts` | Search query parsing, URL building, keyword splitting and relevance scoring |
| `lib/urls.test.ts` | Link normalisation: adds `https://`, refuses `javascript:` and similar |
| `lib/uploads.test.ts` | Image type detection by bytes (SVG/HTML refused), WebP conversion, GPS/EXIF removal, animated GIFs, path-traversal protection |

**What is not covered by automated tests:** database access, API routes and the user interface. During development these were checked by hand against the running app (including with a real headless browser), but there is no end-to-end test suite yet. A good next step is Playwright tests for sign-up, publishing, commenting and bookmarking.

**Quick manual check after starting the app:**

1. Sign up at `/auth/signup`, then sign out and back in.
2. Write a post at `/dashboard/posts/new`: pick the **Travel** category, add tags, upload several photos, publish.
3. Search for a word from the post at `/search` and use the category and tag filters.
4. Comment, give kudos (the star), bookmark, and check Dashboard → Bookmarks and History.

---

## 6. What has been built and changed

### Look and feel
- **"Modern nostalgia" theme:** warm notebook paper with graph grid and film grain in light mode; indigo with glow and CRT scanlines in dark mode. All driven by colour tokens at the top of `src/app/globals.css`.
- Retro window frames, sticker tags, offset "press-in" shadows, a typed-cursor hero, topic ticker, and animations that switch off for people who prefer reduced motion.
- A real landing page, redesigned header and footer shared by every page (public, dashboard, admin, sign-in), and a working light/dark toggle (the dark-mode variant now follows the toggle).
- Post cards with generated covers when there is no image, custom reading styles for published posts (headings, lists, quotes, code, tables), a scroll-progress bar, and a wider "You might also like" section.

### Accounts and profile
- **Email + password sign-up and sign-in** (passwords hashed with bcrypt), with optional Google sign-in. Replaces the earlier magic-link flow.
- Brute-force protection on login, rate limit on sign-up.
- **Profile settings:** edit name and bio, and choose a cartoon avatar (5 styles). The header updates immediately after saving.
- Roles: anyone signed in can write and publish their own posts, edit or delete only their own; admins can manage everything, plus categories, tags, users and comment moderation.

### Writing and publishing
- One shared **post editor** (used by dashboard and admin) with category, tags and destinations, cover image and a draft/publish workflow.
- **Multiple image upload:** pick up to 10 photos at once, drag and drop or paste them into the editor, use the toolbar button, or use the Photos panel to insert any photo or set it as the cover. Photos are checked by their actual bytes (SVG and fake images are refused), resized to at most 2200 px, converted to WebP and stripped of hidden metadata such as GPS location. Served with long-lived caching from `/uploads`.
- Link and image-URL buttons use an in-app dialog instead of the browser's pop-up, with link validation.

### Reading, comments and personal library
- **Comments:** correct totals including replies, replies up to two levels deep, "author" badge, and clear sign-in prompt for visitors.
- **Kudos:** a pixel-art star replaces the heart; your own kudos are remembered across reloads.
- **Bookmarks and reading history** pages: history is now actually recorded, entries can be removed, history can be cleared, and unpublished posts no longer appear.
- Deleting anything now shows an in-app confirmation window instead of the browser's "localhost says..." pop-up.

### Search and travel
- **Search page** with keyword search (every word must match, in titles, text, tags, category and author), category and multi-tag filters, sorting, pagination, highlighted matches, active-filter chips and helpful empty states. Works without JavaScript and results are shareable URLs.
- **Travel:** a Travel category (listed first) and destinations as tags.
- **Sample content:** 20 ready-made posts (10 travel, plus technology, programming and AI) via `npm run db:seed:posts`.
- The Blog page paginates and has its own search box and category shortcuts.

### Security and reliability
- Real HTML sanitising of post content (previously a no-op), including blocking protocol-relative image URLs.
- Rate limits on sign-in, sign-up, comments, search, likes and uploads.
- Input validation on every API that accepts data; permission checks so users can only change their own posts and comments; unpublished drafts are visible only to their author and admins.
- Security headers, startup checks for required settings, and a `/api/health` endpoint.
- Fixes along the way: double-counted page views, broken search filters, comments that crashed the page, likes that were forgotten, replies that disappeared, and a Tiptap hydration warning.

### Code quality and operations
- ESLint clean (0 errors), the `middleware` file renamed to `proxy` (Next 16), shared helpers for API responses and validation.
- Versioned Prisma migrations replace `db push`; `.env.example` added.
- Dockerfile and Compose rewritten (no hard-coded secrets, database not exposed, volume for uploads).
- Unit tests for the security-sensitive code (see [section 5](#5-running-the-tests)).

---

## 7. Project structure

```
prisma/
  schema.prisma          database models
  migrations/            versioned SQL migrations (apply with npm run db:migrate)
  seed.ts                categories, demo users, 2 posts
  seed-posts.ts          20 sample posts
src/
  app/
    (public)/            home, blog, post pages, search, category and tag pages
    (auth)/              sign-in and sign-up
    (dashboard)/         signed-in area: overview, my posts, bookmarks, history, settings
    (admin)/             admin area (admins only)
    api/                 REST endpoints (posts, comments, search, upload, register, health...)
    uploads/[...path]/   serves uploaded images from UPLOAD_DIR
    proxy.ts             route protection (dashboard and admin)
  components/
    ui/                  buttons, cards, dialogs, form controls
    layout/              header, footer, user menu
    features/            post card, editor, comments, search, dashboard pieces
  lib/                   auth, database, search, uploads, rate limiting, validation, helpers
```

---

## 8. Before going live

- [ ] Change the demo account passwords (or never seed them in production).
- [ ] Set strong values for `AUTH_SECRET`, `NEXTAUTH_SECRET` and the database password; keep them out of git.
- [ ] Set `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the real https address.
- [ ] Mount persistent storage at `UPLOAD_DIR`, and back up both the database and the uploads folder.
- [ ] Run `npm audit` and update dependencies with known vulnerabilities.
- [ ] Test the Docker setup on the real host.
- [ ] Add a Content-Security-Policy header (needs a nonce setup, so it was left out).
- [ ] If you run more than one server instance, move rate limiting to Redis: counters are currently per process.

## 9. Known limitations

- **No password reset or email verification yet.** A forgotten password cannot be recovered, and sign-up does not confirm the email address. This needs an email service.
- **Uploads live on local disk.** Fine for one server; for several servers or serverless hosting, switch to object storage (the code is isolated in `src/lib/uploads.ts`).
- **Scheduled posts** have a status but nothing publishes them automatically.
- **Search** ranks the newest 100 matches by relevance; for a very large blog, switch to Postgres full-text search.
- Sample post authors, view counts and dates are made up, and avatars come from the DiceBear web service (check each style's licence before launch).
- No automated end-to-end tests, and no custom 404 or About page yet.

---

## 10. Continuing with Claude Code

This project was built in a single Claude Code session. The whole conversation is saved on the machine it was built on, so you can pick up exactly where it stopped instead of starting over.

| | |
|---|---|
| **Session ID** | `906b449c-36dc-4317-842e-efc45ad8d44d` |
| **Started in folder** | `/home/eshu` |
| **Saved at** | `~/.claude/projects/-home-eshu/906b449c-36dc-4317-842e-efc45ad8d44d.jsonl` |

**Resume this session** (run it from the folder it was started in; Claude Code saves sessions per folder):

```bash
cd /home/eshu
claude --resume 906b449c-36dc-4317-842e-efc45ad8d44d
```

Or, to continue whichever conversation in the current folder was used most recently, run `claude --continue` (short form `claude -c`). Running `claude --resume` with no ID lists your saved sessions so you can choose one.

Optional shortcut: add this line to `~/.bashrc`, then type `second-brain-claude` to jump straight back in:

```bash
alias second-brain-claude='cd /home/eshu && claude --resume 906b449c-36dc-4317-842e-efc45ad8d44d'
```

Good to know:

- The ID and transcript are **local to this machine**. They are not stored in git, so a clone on another computer will not have the session.
- The conversation is very long (the transcript is over 50 MB). Claude Code summarises older parts automatically when needed, so for details of what was built, trust this README and `git log` rather than the transcript.
- If you ever start a fresh session instead, ask Claude to read this README first; it contains everything needed to get oriented.

---

MIT licence, see `LICENSE`.
