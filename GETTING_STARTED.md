# Getting Started with Second Brain

This guide will help you get Second Brain up and running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** installed ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or cloud)
  - Option 1: Local PostgreSQL
  - Option 2: [Neon](https://neon.tech) (recommended, free tier)
  - Option 3: [Supabase](https://supabase.com)
- **Email SMTP** access (Gmail, SendGrid, etc.)
- **Git** installed

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

Or if you have Node.js 22.13+:
```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""  # Generate with: openssl rand -base64 32

# Email for Magic Links (Required)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Optional
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

### Getting Gmail App Password

1. Enable 2FA on your Google account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Click "App passwords"
4. Generate a password for "Mail"
5. Copy the 16-character password to `.env`

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: Set Up Database

### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Paste it as `DATABASE_URL` in `.env`

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL if needed
# macOS:
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb secondbrain

# Update .env
DATABASE_URL="postgresql://localhost:5432/secondbrain"
```

## Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 6: Create Admin User

### If you ran the seed:
- Admin email: `admin@example.com`
- Regular user: `user@example.com`

### If you didn't seed:
1. Sign in with any email at `/auth/signin`
2. Check your email for the magic link
3. Click the link to sign in
4. Promote yourself to admin:

**Using Prisma Studio:**
```bash
npx prisma studio
```
Then edit your user and change `role` to `ADMIN`.

**Or using SQL:**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## Step 7: Access the Platform

- **Homepage:** [http://localhost:3000](http://localhost:3000)
- **Blog:** [http://localhost:3000/blog](http://localhost:3000/blog)
- **Sign In:** [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin) (requires admin role)

## Common Issues

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database connection error

- Check your `DATABASE_URL` is correct
- Ensure database server is running
- Test connection with: `npx prisma db pull`

### Email not sending

- Verify SMTP credentials
- Check spam folder
- For Gmail, ensure app password (not regular password)
- Test with: [Ethereal Email](https://ethereal.email) for development

### Build errors

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
```

## Development Tools

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens at [http://localhost:5555](http://localhost:5555)

### Format Code

```bash
npm run format
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

## Next Steps

1. **Create your first post** - Go to `/admin` and click "New Post"
2. **Customize branding** - Edit `src/config/site.ts`
3. **Add categories** - Create categories in admin panel
4. **Invite users** - Share the sign-in link
5. **Deploy to production** - See [README.md](./README.md#deployment)

## Need Help?

- 📖 [Full Documentation](./README.md)
- 📋 [Project Status](./PROJECT_STATUS.md)
- 🔧 [Setup Guide](./SETUP_GUIDE.md)
- 🤝 [Contributing](./CONTRIBUTING.md)

## Quick Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database

# Code Quality
npm run lint             # Run linter
npm run format           # Format code
npm run type-check       # Check types
```

---

🎉 **You're all set!** Start building your knowledge-sharing platform.
