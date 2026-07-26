# Second Brain

**Tagline:** Capture Ideas. Share Knowledge.

A modern, production-ready blogging platform built with Next.js 15+, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

### For Readers (Public)
- Browse and read blog posts
- Advanced search with filters (category, tags, author)
- Comment on articles and reply to comments
- View author profiles and related articles
- Dark/Light mode support
- Responsive design for all devices

### For Authenticated Users
- Magic link email authentication (passwordless)
- Save and bookmark articles
- View reading history
- Comment, like, and interact with content
- Personal dashboard
- Profile management

### For Admins
- Complete admin dashboard with analytics
- Rich text editor (Tiptap) with:
  - Headings, images, videos, tables
  - Code blocks with syntax highlighting
  - Markdown support
  - Drag-and-drop images
- Draft, publish, and schedule posts
- Category and tag management
- User management
- Comment moderation
- Featured and pinned articles

## 📦 Tech Stack

- **Framework:** Next.js 16.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui + Radix UI
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5 (Magic Links)
- **Editor:** Tiptap
- **Image Upload:** UploadThing
- **Email:** Nodemailer
- **Animations:** Framer Motion
- **Icons:** Lucide Icons
- **Form Validation:** React Hook Form + Zod
- **Deployment:** Vercel

## ⚡ ONE-COMMAND SETUP (Fastest Way!)

### Prerequisites
- Node.js 20+
- PostgreSQL

### Run This ONE Command:

**macOS/Linux:**
```bash
./setup-and-run.sh
```

**Windows:**
```cmd
setup-and-run.bat
```

**Done!** It will install everything, set up the database, and open your browser automatically!

📖 **See [ONE_COMMAND_SETUP.md](ONE_COMMAND_SETUP.md) for details**

---

## 🛠️ Manual Installation (Alternative)

### Prerequisites
- Node.js 20+ (v22.13+ recommended for full compatibility)
- PostgreSQL database (Neon, Supabase, or local)
- Email SMTP server (Gmail, SendGrid, etc.)

### Step 1: Clone and Install

```bash
# Navigate to the project directory
cd second-brain

# Install dependencies
npm install --legacy-peer-deps

# Or use a newer Node version and:
# npm install
```

### Step 2: Database Setup

```bash
# Set up your database URL in .env
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example for Neon:
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/secondbrain?sslmode=require"
```

### Step 3: Environment Variables

Edit `.env` and fill in all required values:

```env
DATABASE_URL="your_postgresql_connection_string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database schema
npx prisma db push

# (Optional) Seed database with sample data
npx prisma db seed
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📂 Project Structure

```
second-brain/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── (admin)/          # Admin routes
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (public)/         # Public pages
│   │   ├── api/              # API routes
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── features/         # Feature-specific components
│   │   ├── layout/           # Layout components
│   │   ├── providers/        # React providers
│   │   ├── shared/           # Shared components
│   │   └── ui/               # shadcn/ui components
│   ├── config/               # Configuration files
│   ├── lib/
│   │   ├── actions/          # Server actions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── validations/      # Zod schemas
│   │   ├── auth.ts           # Auth configuration
│   │   └── db.ts             # Database client
│   ├── services/             # Business logic
│   ├── types/                # TypeScript types


## 🗄️ Database Schema

The application uses a comprehensive Prisma schema with the following models:

- **User** - User accounts and profiles with roles (USER, ADMIN)
- **Post** - Blog posts with status (DRAFT, PUBLISHED, SCHEDULED)
- **Category** - Post categories with customizable colors and icons
- **Tag** - Post tags for better organization
- **Comment** - Nested comments system with unlimited reply depth
- **CommentLike** - Like system for comments
- **Bookmark** - User bookmarks for saving articles
- **ViewHistory** - Track reading history per user
- **Newsletter** - Newsletter subscriber management
- **Notification** - User notification system
- **Media** - File upload tracking
- **Account/Session/VerificationToken** - NextAuth.js authentication models
- **Announcement** - Site-wide announcements

## 🔐 Authentication

This platform uses **passwordless authentication** via magic links:

1. User enters their email address
2. System sends a secure magic link to their email
3. User clicks the link to authenticate
4. Session is created and user is logged in

**No passwords to remember or manage!**

## 📝 Creating Your First Admin User

After initial setup, manually promote a user to admin:

**Option 1: Using Prisma Studio (Recommended)**
```bash
npx prisma studio
```
Then navigate to the User model and change the `role` field to `ADMIN`.

**Option 2: Using SQL**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Environment Variables**
   Add all variables from `.env.example`:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (set to your production URL)
   - `NEXTAUTH_SECRET`
   - Email configuration variables
   - UploadThing credentials (if using)

4. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Your site is live!

### Database Providers

**Neon (Recommended)**
- Serverless PostgreSQL
- Free tier available
- Instant setup
- Visit: [neon.tech](https://neon.tech)

**Supabase**
- PostgreSQL with additional features
- Free tier available
- Built-in auth (optional)
- Visit: [supabase.com](https://supabase.com)

**Railway**
- Simple deployment platform
- PostgreSQL included
- Visit: [railway.app](https://railway.app)

## 🌐 Custom Domain Setup

### Buying a Domain

1. **Domain Registrars:**
   - [Namecheap](https://www.namecheap.com)
   - [Google Domains](https://domains.google)
   - [Cloudflare](https://www.cloudflare.com/products/registrar/)
   - [GoDaddy](https://www.godaddy.com)

2. **Purchase your domain** (e.g., `mysecondbrain.com`)

### Connecting to Vercel

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Click "Domains"
   - Enter your custom domain
   - Click "Add"

2. **Configure DNS:**
   - In your domain registrar, add these DNS records:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS propagation** (5 minutes to 48 hours)

4. **Enable HTTPS:**
   - Vercel automatically provisions SSL certificate
   - Force HTTPS redirect in Vercel settings

5. **Redirect www to non-www (or vice versa):**
   - In Vercel domain settings
   - Set one as primary domain

6. **Update Environment Variables:**
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
   ```

## 📧 Email Configuration

### Using Gmail

1. **Enable 2-Factor Authentication** on your Google account

2. **Create an App Password:**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Select "App passwords"
   - Generate password for "Mail"
   - Copy the 16-character password

3. **Update .env:**
   ```env
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-16-char-app-password
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Using SendGrid (Production Recommended)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Configure:
   ```env
   EMAIL_SERVER_HOST=smtp.sendgrid.net
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=apikey
   EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize theme colors:

```css
:root {
  --primary: 0 0% 9%;        /* Black */
  --accent: 217 91% 60%;     /* Blue */
  /* Modify other color variables */
}

.dark {
  --primary: 0 0% 98%;       /* White */
  /* Dark mode colors */
}
```

### Site Configuration

Edit `src/config/site.ts`:

```typescript
export const siteConfig = {
  name: "Your Site Name",
  tagline: "Your Tagline",
  description: "Your description",
  // ... more configuration
};
```

### Categories

Add or modify categories in `src/config/site.ts`:

```typescript
export const CATEGORIES = [
  { name: "Tech", slug: "tech", color: "#3B82F6", icon: "Laptop" },
  // Add more categories
];
```

## 🛠️ Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript compiler check
```

## 📚 API Documentation

### Public Endpoints

- `GET /api/posts` - Get all published posts
- `GET /api/posts/[slug]` - Get single post
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get all tags
- `GET /api/search` - Search posts

### Protected Endpoints (Authentication Required)

- `POST /api/posts` - Create post (Admin only)
- `PUT /api/posts/[id]` - Update post (Admin only)
- `DELETE /api/posts/[id]` - Delete post (Admin only)
- `POST /api/comments` - Create comment
- `POST /api/bookmarks` - Bookmark post

See full API documentation in `/docs/API.md`

## 🧪 Testing (Future Enhancement)

Testing infrastructure is ready for:
- Unit tests with Jest
- Integration tests
- E2E tests with Playwright

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - Free for personal and commercial use.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Tiptap](https://tiptap.dev/)

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/second-brain/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/second-brain/discussions)

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

*Ready for production deployment and thousands of users.*
