# Complete Setup Guide - Second Brain

This guide contains **EVERYTHING** you need to set up Second Brain locally and deploy it to production with a custom domain.

---

## Part 1: Local Setup with Local PostgreSQL Database

### Step 1: Install Prerequisites

**Install Node.js 20+**
```bash
# Download from https://nodejs.org/
# Or use nvm:
nvm install 20
nvm use 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Install PostgreSQL**

**On macOS:**
```bash
# Install using Homebrew
brew install postgresql@16

# Start PostgreSQL
brew services start postgresql@16

# Verify it's running
psql --version
```

**On Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

**On Windows:**
```bash
# Download installer from:
# https://www.postgresql.org/download/windows/
# Install and remember the password you set for postgres user
```

### Step 2: Create Database

**On macOS/Linux:**
```bash
# Create a database
createdb secondbrain

# Test connection
psql secondbrain
# Type \q to exit
```

**On Windows:**
```bash
# Open Command Prompt and run:
psql -U postgres

# Inside psql, create database:
CREATE DATABASE secondbrain;

# Exit
\q
```

### Step 3: Clone/Navigate to Project

```bash
# If you already have the project
cd /path/to/second-brain

# If you need to clone from GitHub (after pushing)
git clone https://github.com/yourusername/second-brain.git
cd second-brain
```

### Step 4: Install Dependencies

```bash
npm install --legacy-peer-deps
```

**If you get errors**, try:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 5: Configure Environment Variables

**Create .env file:**
```bash
cp .env.example .env
```

**Edit .env file** (use nano, vim, or any text editor):
```bash
nano .env
```

**Add this content:**
```env
# Database Connection
DATABASE_URL="postgresql://localhost:5432/secondbrain"

# For Windows, if you set a password:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/secondbrain"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-change-me"

# Email Configuration (Use Gmail for testing)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@secondbrain.com"

# Optional (leave empty for now)
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

**Generate NEXTAUTH_SECRET:**
```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Copy the output and paste it as NEXTAUTH_SECRET value
```


```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Configure DNS at Your Domain Registrar

**For Namecheap:**
1. Log in to Namecheap
2. Click "Domain List"
3. Click "Manage" next to your domain
4. Go to "Advanced DNS" tab
5. Click "Add New Record"

**Add these records:**

**Record 1:**
- Type: `A Record`
- Host: `@`
- Value: `76.76.21.21`
- TTL: `Automatic`

**Record 2:**
- Type: `CNAME Record`
- Host: `www`
- Value: `cname.vercel-dns.com`
- TTL: `Automatic`

6. Click "Save All Changes"

**For Google Domains:**
1. Go to https://domains.google.com
2. Click your domain
3. Click "DNS" on the left
4. Scroll to "Custom resource records"

**Add:**
- Name: `@`, Type: `A`, TTL: `1H`, Data: `76.76.21.21`
- Name: `www`, Type: `CNAME`, TTL: `1H`, Data: `cname.vercel-dns.com`

**For Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to "DNS" tab
4. Add records as shown above
5. Make sure "Proxy status" is ON (orange cloud)

### Step 4: Wait for DNS Propagation

**Time:** 5 minutes to 48 hours (usually 15-30 minutes)

**Check status:**
```bash
# Check if DNS is updated
nslookup secondbrain.com

# Or use online tool:
# https://www.whatsmydns.net
```

### Step 5: Verify in Vercel

1. Go back to Vercel → Settings → Domains
2. Wait until you see a checkmark ✓ next to your domain
3. Click "Visit" to test

**SSL Certificate:** Vercel automatically provisions SSL (HTTPS) for free!

### Step 6: Set Primary Domain

In Vercel Domains settings:
1. Find `secondbrain.com`
2. Click the three dots `...`
3. Click "Set as Primary"

This redirects `www.secondbrain.com` → `secondbrain.com`

### Step 7: Update Environment Variables

In Vercel:
1. Go to Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Change from Vercel URL to: `https://secondbrain.com`
4. Click "Save"
5. Go to "Deployments" tab
6. Click "Redeploy" on the latest deployment

### Step 8: Test Your Domain!

1. Open browser
2. Go to: **https://secondbrain.com**
3. You should see your homepage!
4. Test: **https://www.secondbrain.com** (should redirect to non-www)

---

## Part 5: Post-Deployment Setup

### Create Admin User in Production

**Option 1: Via Neon Dashboard**
1. Go to https://neon.tech
2. Select your project
3. Click "SQL Editor"
4. Run this query:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

**Option 2: Via Prisma Studio (Local Connection to Production)**
```bash
# Set production database URL
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Open Prisma Studio
npx prisma studio

# Go to http://localhost:5555
# Edit User → Change role to ADMIN
```

### Test Production Site

1. **Homepage:** https://secondbrain.com
2. **Blog:** https://secondbrain.com/blog
3. **Sign In:** https://secondbrain.com/auth/signin
4. **Admin:** https://secondbrain.com/admin

---

## Troubleshooting

### Local Development Issues

**Problem: Can't connect to PostgreSQL**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Restart if needed:
brew services restart postgresql@16
# Or:
sudo systemctl restart postgresql
```

**Problem: Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

**Problem: Prisma errors**
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-push schema
npx prisma db push
```

**Problem: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Production/Deployment Issues

**Problem: Build fails on Vercel**
- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Redeploy after adding variables

**Problem: Database connection error**
- Verify DATABASE_URL is correct
- Check if Neon project is active
- Make sure connection string includes `?sslmode=require`

**Problem: Magic link emails not sending**
- Verify EMAIL_SERVER_* variables in Vercel
- Check spam folder
- Try with a different email provider

**Problem: Domain not working**
- Wait longer (DNS can take up to 48 hours)
- Check DNS records are correct
- Clear browser cache
- Try incognito/private mode

**Problem: 404 on pages**
- Make sure redeploy happened after adding domain
- Check that NEXTAUTH_URL points to your domain

---

## Quick Reference

### Local Development
```bash
npm run dev              # Start dev server
npx prisma studio        # Open database GUI
npx prisma db push       # Update database schema
npx prisma db seed       # Add sample data
npm run build            # Test production build
npm run lint             # Check code quality
```

### Database URLs

**Local:**
```
postgresql://localhost:5432/secondbrain
```

**Production (Neon):**
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Important URLs

**Local:**
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555

**Production:**
- App: https://secondbrain.com
- Vercel Dashboard: https://vercel.com/dashboard
- Neon Dashboard: https://console.neon.tech

---

## Summary Checklist

### Local Setup ✓
- [ ] Node.js 20+ installed
- [ ] PostgreSQL installed and running
- [ ] Database created (`secondbrain`)
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] .env file created and configured
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Database seeded (`npx prisma db seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign in and become admin

### GitHub ✓
- [ ] Git initialized
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub

### Production Deployment ✓
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Neon database created
- [ ] Environment variables added in Vercel
- [ ] Production database initialized
- [ ] Deployment successful
- [ ] Can access Vercel URL

### Custom Domain ✓
- [ ] Domain purchased
- [ ] Domain added to Vercel
- [ ] DNS records configured at registrar
- [ ] DNS propagated (checkmark in Vercel)
- [ ] SSL certificate active (HTTPS works)
- [ ] Primary domain set
- [ ] NEXTAUTH_URL updated to custom domain
- [ ] Redeployed
- [ ] Can access https://secondbrain.com
- [ ] Admin user created in production

---

**🎉 CONGRATULATIONS! You now have a fully functional, production-ready blog platform running at https://secondbrain.com!**

---

## Next Steps

1. **Customize branding:** Edit `src/config/site.ts`
2. **Create your first post:** Go to https://secondbrain.com/admin
3. **Invite users:** Share the sign-in link
4. **Build remaining features:** See TODO.md for checklist

For questions, refer to:
- README.md - Full documentation
- COMMANDS.md - Command reference
- TODO.md - Features to build


**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if not enabled
3. Search for "App passwords"
4. Select "Mail" and generate password
5. Copy the 16-character password
6. Paste it as EMAIL_SERVER_PASSWORD in .env

### Step 6: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with sample data (optional but recommended)
npx prisma db seed
```

**If seed is successful, you'll see:**
- ✅ Created admin user: admin@example.com
- ✅ Created regular user: user@example.com
- ✅ Created 3 categories
- ✅ Created 3 tags
- ✅ Created 2 sample posts

### Step 7: Run the Development Server

```bash
npm run dev
```

**You should see:**
```
▲ Next.js 16.2.12
- Local:        http://localhost:3000
- ready in 2.3s
```

### Step 8: Access the Application

Open your browser and go to:
- **Homepage**: http://localhost:3000
- **Blog**: http://localhost:3000/blog
- **Sign In**: http://localhost:3000/auth/signin

### Step 9: Sign In and Become Admin

**Option 1: Use seeded account**
1. Go to http://localhost:3000/auth/signin
2. Enter: `admin@example.com`
3. Check your email for magic link
4. Click the link to sign in
5. You're now logged in as admin!

**Option 2: Create new account and promote to admin**
1. Go to http://localhost:3000/auth/signin
2. Enter your email
3. Check email and click magic link
4. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```
5. Go to http://localhost:5555
6. Click on "User" table
7. Find your user and change `role` from `USER` to `ADMIN`
8. Save
9. Refresh your browser

### Step 10: Access Admin Dashboard

Go to: http://localhost:3000/admin

You should see the admin dashboard with statistics!

---

## Part 2: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name: `second-brain`
4. Description: "A modern blogging platform"
5. Make it **Public** or **Private**
6. **DO NOT** initialize with README (we already have one)
7. Click "Create repository"

### Step 2: Initialize Git (if not already)

```bash
# Check if git is initialized
git status

# If not initialized:
git init
```

### Step 3: Create .gitignore (already exists, but verify)

Make sure `.env` is in `.gitignore`:
```bash
cat .gitignore | grep .env
# Should show: .env
```

### Step 4: Commit Your Code

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Production-ready blog platform"

# Check status
git status  # Should say "nothing to commit, working tree clean"
```

### Step 5: Push to GitHub

**Copy the commands from GitHub** (they look like this):

```bash
git remote add origin https://github.com/yourusername/second-brain.git
git branch -M main
git push -u origin main
```

**Enter GitHub credentials when prompted.**

### Step 6: Verify on GitHub

Go to your repository URL:
`https://github.com/yourusername/second-brain`

You should see all your files!

---

## Part 3: Deploy to Vercel with Custom Domain

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. **Sign up with GitHub** (easiest option)
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. On Vercel dashboard, click "Add New"
2. Click "Project"
3. Find your `second-brain` repository
4. Click "Import"

### Step 3: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Root Directory:** `./` (leave as is)

**Build Command:** `npm run build` (auto-filled)

**Output Directory:** `.next` (auto-filled)

### Step 4: Add Environment Variables

Click "Environment Variables" and add these **ONE BY ONE**:

```
DATABASE_URL = postgresql://your-production-db-url
NEXTAUTH_URL = https://secondbrain.com
NEXTAUTH_SECRET = [paste the same secret from local .env]
EMAIL_SERVER_HOST = smtp.gmail.com
EMAIL_SERVER_PORT = 587
EMAIL_SERVER_USER = your-email@gmail.com
EMAIL_SERVER_PASSWORD = [your app password]
EMAIL_FROM = noreply@secondbrain.com
```

**IMPORTANT: You need a production database!**

### Step 5: Set Up Production Database (Neon - FREE)

1. Go to https://neon.tech
2. Sign up (free account)
3. Click "Create Project"
4. Name: `second-brain-production`
5. Region: Choose closest to you
6. Click "Create Project"
7. **Copy the connection string** (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
8. Go back to Vercel
9. Paste this as `DATABASE_URL` value

### Step 6: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes
3. You'll see "Congratulations!" when done
4. You get a URL like: `https://second-brain-abc123.vercel.app`

### Step 7: Initialize Production Database

Open your terminal and run:

```bash
# Set the production database URL temporarily
export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push schema
npx prisma db push

# Seed database
npx prisma db seed
```

Now your production database has tables and sample data!

---

## Part 4: Connect Custom Domain (http://secondbrain.com)

### Step 1: Buy a Domain

**Recommended Registrars:**
- **Namecheap** - https://www.namecheap.com (~$10/year)
- **Google Domains** - https://domains.google
- **Cloudflare** - https://www.cloudflare.com/products/registrar/

**Steps:**
1. Search for "secondbrain.com" (or your preferred name)
2. If available, add to cart
3. Purchase (usually $8-15/year)
4. Complete registration

### Step 2: Add Domain to Vercel

1. In Vercel, go to your project
2. Click "Settings" tab
3. Click "Domains"
4. Enter: `secondbrain.com`
5. Click "Add"

**Vercel will show you DNS records to add:**

