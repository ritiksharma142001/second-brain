# Deploying Second Brain to Vercel

This guide covers everything needed to run Second Brain on [Vercel](https://vercel.com): the code changes that make it work there, the services to connect, the settings to add, and how to check it all works.

- **Vercel project:** <https://vercel.com/ritik-sharmas-projects-b69f333a/second-brain>
- **GitHub repo:** <https://github.com/ritiksharma142001/second-brain> (every push to `main` deploys automatically)

---

## Contents

1. [How it fits together](#1-how-it-fits-together)
2. [Code changes made for Vercel](#2-code-changes-made-for-vercel)
3. [Step 1 — Create or import the Vercel project](#step-1--create-or-import-the-vercel-project)
4. [Step 2 — Connect the database (Neon)](#step-2--connect-the-database-neon)
5. [Step 3 — Connect image storage (Vercel Blob)](#step-3--connect-image-storage-vercel-blob)
6. [Step 4 — Add the environment variables](#step-4--add-the-environment-variables)
7. [Step 5 — Deploy (or redeploy)](#step-5--deploy-or-redeploy)
8. [Step 6 — Set the site address](#step-6--set-the-site-address)
9. [Step 7 — Make your account the admin](#step-7--make-your-account-the-admin)
10. [Step 8 — Password-reset emails (optional)](#step-8--password-reset-emails-optional)
11. [Step 9 — Custom domain (optional)](#step-9--custom-domain-optional)
12. [Checklist](#checklist)
13. [Troubleshooting](#troubleshooting)

---

## 1. How it fits together

| Piece                 | Service                                | Why                                                                        |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| App (pages + API)     | **Vercel**                             | Builds and hosts the Next.js app.                                          |
| Database              | **Neon Postgres** (via Vercel Storage) | The app needs PostgreSQL. Vercel has none built in.                        |
| Uploaded images       | **Vercel Blob** (public store)         | Vercel servers have no lasting disk, so images saved to disk would vanish. |
| Password-reset emails | Any SMTP service, e.g. **Resend**      | Optional; without it, "forgot password" can't send emails.                 |

Database tables are created and updated **automatically on every deploy** (see `vercel-build` below).

---

## 2. Code changes made for Vercel

These are already in the repo (commit _"Prepare for Vercel deployment"_). Local development is unchanged.

### `src/lib/uploads.ts` — images go to Vercel Blob

`saveUpload()` now chooses where to store images:

| Situation                                                  | Where images go                                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Blob store is connected (`BLOB_READ_WRITE_TOKEN` is set) | **Vercel Blob**, as public files cached for a year. The returned URL is the Blob URL.                                                                                   |
| Running on Vercel **without** Blob                         | The upload **fails with a clear error** in the logs (_"Image storage isn't configured: connect a Vercel Blob store"_) instead of writing files that silently disappear. |
| Local development                                          | The `uploads/` folder on disk, exactly as before.                                                                                                                       |

Images are still checked, resized and re-encoded to WebP before storing; only the final save changed. The post editor, the HTML sanitiser and the cover-image validation already accept full `https://` image URLs, so Blob URLs work everywhere without other changes.

### `package.json` — new `vercel-build` script

```json
"vercel-build": "DATABASE_URL=\"${DATABASE_URL_UNPOOLED:-$DATABASE_URL}\" prisma migrate deploy && next build"
```

Vercel runs `vercel-build` instead of `build` when it exists. It:

1. **Applies database migrations** (`prisma migrate deploy`) so new tables exist before the new code runs.
2. Uses Neon's **direct** connection (`DATABASE_URL_UNPOOLED`) for migrations, because migrations can't run through Neon's pooled connection. The app itself still uses the pooled `DATABASE_URL`.
3. Then builds the app.

Local `npm run build` is unchanged.

### `.npmrc` — install like the README says

```
legacy-peer-deps=true
```

The README installs with `npm install --legacy-peer-deps` because of a peer-dependency conflict. Vercel runs plain `npm install`, so this file tells it to use the same flag.

### `@vercel/blob` dependency

Added to `package.json` for the Blob upload code.

---

## Step 1 — Create or import the Vercel project

If the project doesn't exist yet:

1. Go to <https://vercel.com/new> and **import** the `second-brain` GitHub repo.
2. Framework: **Next.js** (detected automatically). Leave build and install commands empty — `vercel-build` and `.npmrc` handle them.
3. Click **Deploy**. The first build **will fail** because there's no database yet — that's expected. Continue with Step 2.

> **One project only.** If the repo was imported twice (e.g. `second-brain` and `second-brain-9zjc`), delete the extra one: open it → **Settings** → bottom of the page → **Delete Project**. Otherwise every push builds twice.

---

## Step 2 — Connect the database (Neon)

1. Open the project → **Storage** tab → **Create Database** → **Neon** → **Continue**.
2. **Configuration and plan:**

   | Setting  | Choose                           | Why                                                                   |
   | -------- | -------------------------------- | --------------------------------------------------------------------- |
   | Region   | **Washington, D.C., USA (East)** | Same region as Vercel's servers (`iad1`), so database calls are fast. |
   | Auth     | **Off**                          | The app has its own login (NextAuth).                                 |
   | Realtime | **Off**                          | Not used.                                                             |
   | Plan     | **Free**                         | 1 GB is plenty to start.                                              |

3. **Connect a project:**

   | Setting                               | Choose                  | Why                                                                                                                                                                                |
   | ------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | Project                               | `second-brain`          |                                                                                                                                                                                    |
   | Environments                          | **Production, Preview** |                                                                                                                                                                                    |
   | Create database branch for deployment | **Both unticked**       | Previews share the main database; simpler and within the free plan.                                                                                                                |
   | **Custom Prefix**                     | Type **`DATABASE`**     | Creates `DATABASE_URL` — the exact name the app reads. The grey "STORAGE" text is only a placeholder; leaving it empty may create `STORAGE_URL` instead, which the app won't find. |
   | Sensitive                             | **On**                  | Keeps the password hidden in the dashboard.                                                                                                                                        |

4. Click **Connect**.
5. **Check:** the database page lists `DATABASE_URL` and `DATABASE_URL_UNPOOLED`, and _Connected Projects_ shows `second-brain`.

> Never share the connection-string snippet or click **Show secret** in screenshots — it contains the database password.

> **Don't connect an unrelated database.** The _Connect to a Database_ list may show databases from other projects. Create a new one for Second Brain.

---

## Step 3 — Connect image storage (Vercel Blob)

1. Project → **Storage** → **Create** → **Blob**.
2. Settings:

   | Setting    | Choose                | Why                                                                                          |
   | ---------- | --------------------- | -------------------------------------------------------------------------------------------- |
   | Name       | `second-brain-blob`   |                                                                                              |
   | **Access** | **Public**            | Post images must be viewable by every reader. A **Private** store rejects the app's uploads. |
   | Region     | **IAD1** (Washington) | Same as the database and servers.                                                            |

3. **Connect** it to `second-brain` (Production, Preview). This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. **Check:** the store page shows a **Public** label.

> If you created it as **Private** by mistake: it's empty, so delete it (store **Settings** → **Delete**) and create a new **Public** one.

You can ignore the "Getting Started" guide on the Blob page — the code is already set up.

---

## Step 4 — Add the environment variables

Project → **Settings** → **Environment Variables**. Add these for **Production** and **Preview**:

| Name                   | Value                                                         | Notes                                                                                                 |
| ---------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`          | A random secret                                               | Generate in **your own** terminal: `openssl rand -base64 32`. Don't paste it into chats or commit it. |
| `NEXTAUTH_SECRET`      | Same value as `AUTH_SECRET`                                   |                                                                                                       |
| `AUTH_TRUST_HOST`      | `true`                                                        | Required behind Vercel's proxy.                                                                       |
| `NEXTAUTH_URL`         | The site address, e.g. `https://second-brain-xxxx.vercel.app` | Add after the first successful deploy (Step 6).                                                       |
| `NEXT_PUBLIC_SITE_URL` | Same address                                                  | Used for links, sitemap, RSS and share previews.                                                      |

Added automatically by the integrations (don't type these):

| Name                                                             | From          |
| ---------------------------------------------------------------- | ------------- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (+ `PG*` / `POSTGRES_*`) | Neon (Step 2) |
| `BLOB_READ_WRITE_TOKEN`                                          | Blob (Step 3) |

**Not needed on Vercel:** `UPLOAD_DIR` (Blob replaces it). **Leave unset:** `ADMIN_PASSWORD` (don't seed demo accounts in production).

Optional: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED=true` for Google sign-in, and the `EMAIL_*` variables (Step 8).

> Environment variable changes only apply to **new** deploys. Always redeploy after changing them.

---

## Step 5 — Deploy (or redeploy)

**Redeploy from the dashboard:**

1. Project → **Deployments** tab (<https://vercel.com/ritik-sharmas-projects-b69f333a/second-brain/deployments>).
2. On the top row, click **⋯** at the right end → **Redeploy**.
3. Leave **"Use existing Build Cache" unticked** → **Redeploy**.
4. Wait 2–3 minutes for a green **Ready**.

**Or redeploy from git:** push any commit to `main`. An empty one works:

```bash
git commit --allow-empty -m "Redeploy" && git push
```

**What a good build log shows:**

```
> prisma migrate deploy
... migrations applied (or "No pending migrations to apply")
> next build
✓ Compiled successfully
```

The warning _"The configuration property `package.json#prisma` is deprecated"_ is harmless (it's about Prisma 7).

---

## Step 6 — Set the site address

1. After the first green **Ready**, copy the production address from the project overview (**Domains**), e.g. `https://second-brain-xxxx.vercel.app`.
2. Add it as `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` (Step 4).
3. **Redeploy** (Step 5). Password-reset links, share links and the sitemap now use the right address.

---

## Step 7 — Make your account the admin

New sign-ups are regular users, and only an admin can promote others. To create the first admin without the demo accounts:

1. Open the live site and **sign up** with your own email and a strong password.
2. In Vercel, open **Storage** → your Neon database → **Open in Neon** → **SQL Editor**.
3. Run (with your email):

   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```

   It should report **1 row** updated.

4. Sign out and back in. The **Admin** area appears in the menu.

From then on, promote other users from the admin area.

---

## Step 8 — Password-reset emails (optional)

Without email settings, everything works except "forgot password" emails. To enable them with [Resend](https://resend.com) (free tier):

1. Create a Resend account and an **API key**. To send from your own address, verify your domain in Resend.
2. Add these environment variables:

   | Name                    | Value                                   |
   | ----------------------- | --------------------------------------- |
   | `EMAIL_SERVER_HOST`     | `smtp.resend.com`                       |
   | `EMAIL_SERVER_PORT`     | `465`                                   |
   | `EMAIL_SERVER_USER`     | `resend`                                |
   | `EMAIL_SERVER_PASSWORD` | Your Resend API key                     |
   | `EMAIL_FROM`            | `Second Brain <noreply@yourdomain.com>` |

3. Redeploy, then test **Forgot password** on the live site.

Any other SMTP service works with the same variables.

---

## Step 9 — Custom domain (optional)

1. Project → **Settings** → **Domains** → **Add** (or **Buy**).
2. If bought elsewhere, add the DNS records Vercel shows at your registrar. HTTPS is set up automatically.
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the new domain and **redeploy**.

---

## Checklist

- [ ] Only one Vercel project is connected to the repo
- [ ] Neon database connected — `DATABASE_URL` and `DATABASE_URL_UNPOOLED` exist
- [ ] Blob store is **Public** and connected — `BLOB_READ_WRITE_TOKEN` exists
- [ ] `AUTH_SECRET`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST` added
- [ ] Deployed: green **Ready**
- [ ] `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` set to the real address, then redeployed
- [ ] Signed up and promoted your account to **ADMIN**
- [ ] Tested: sign in, write a post, **upload an image**, publish, view it signed out
- [ ] (Optional) Email configured and **Forgot password** tested
- [ ] Demo accounts **not** seeded in production

---

## Troubleshooting

| Problem in the build log / site                                                         | Cause                                                                   | Fix                                                                                                                                           |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Error code: P1012 … The environment variable DATABASE_URL resolved to an empty string` | No database connected, or it was connected with a different prefix      | Do Step 2 with prefix **`DATABASE`**, then redeploy. If the variables have other names (e.g. `STORAGE_URL`), reconnect with the right prefix. |
| `Found invalid or discontinued Node.js Version`                                         | The project is set to an old Node.js version                            | **Settings → Build and Deployment → Node.js Version**: choose the newest offered (the app needs ≥ 20.9).                                      |
| `ERESOLVE could not resolve` during install                                             | Peer-dependency conflict                                                | Make sure `.npmrc` (with `legacy-peer-deps=true`) is committed.                                                                               |
| Image upload says _"Could not process this image"_                                      | Blob not connected, or the store is **Private**                         | Function logs show the real reason. Do Step 3 with a **Public** store, then redeploy.                                                         |
| Sign-in fails or redirects to the wrong site                                            | `NEXTAUTH_URL` wrong or missing, or `AUTH_SECRET` missing               | Check Step 4 / Step 6 values, then redeploy.                                                                                                  |
| Changed a variable but nothing changed                                                  | Variables only apply to new builds                                      | Redeploy (Step 5).                                                                                                                            |
| Builds run twice on every push                                                          | The repo is connected to two Vercel projects                            | Delete the duplicate project (Step 1).                                                                                                        |
| Rate limits feel inconsistent                                                           | Counters are kept per server instance (see README, _Before going live_) | Fine for small traffic; move rate limiting to Redis (e.g. Upstash) for more.                                                                  |

**Seeing a failed build's full log:** open the deployment in **Deployments** and scroll the **Build Logs**, or run `npx vercel inspect <deployment-id> --logs` after `npx vercel login`.
