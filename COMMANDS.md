# Second Brain - Quick Command Reference

Essential commands for developing and deploying Second Brain.

## 🚀 Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env
# Then edit .env with your credentials

# Generate Prisma Client
npx prisma generate

# Initialize database
npx prisma db push

# Seed with sample data (optional)
npx prisma db seed

# Start development server
npm run dev
```

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## 🗄️ Database Commands

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create a migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Pull schema from existing database
npx prisma db pull

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

## 🎨 UI Components

```bash
# Add shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add switch
npx shadcn@latest add tooltip
npx shadcn@latest add skeleton
npx shadcn@latest add popover

# Add all at once (copy-paste friendly)
npx shadcn@latest add dropdown-menu avatar badge dialog select tabs separator switch tooltip skeleton popover
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t second-brain .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 🌐 Environment Variables

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Test database connection
npx prisma db execute --stdin < /dev/null

# View environment variables (be careful!)
cat .env
```

## 🔍 Debugging

```bash
# Clear Next.js cache
rm -rf .next

# Clear all caches and reinstall
rm -rf node_modules .next
npm install --legacy-peer-deps

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Run on different port
PORT=3001 npm run dev

# Enable Next.js debug mode
NODE_OPTIONS='--inspect' npm run dev
```

## 📦 Dependencies

```bash
# Install new package
npm install package-name --legacy-peer-deps

# Install dev dependency
npm install -D package-name --legacy-peer-deps

# Update all dependencies
npm update

# Check for outdated packages
npm outdated

# Audit security
npm audit

# Fix security issues
npm audit fix
```

## 🧪 Testing (When Implemented)

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🚢 Deployment

```bash
# Build and test production build
npm run build
npm run start

# Deploy to Vercel (if Vercel CLI installed)
vercel

# Deploy to production
vercel --prod
```

## 🔧 Git Commands

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git remote add origin your-repo-url
git push -u origin main

# Create new branch
git checkout -b feature/your-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/your-feature
```

## 📝 Useful One-Liners

```bash
# Count lines of code
find src -name '*.tsx' -o -name '*.ts' | xargs wc -l

# Find TODO comments
grep -r "TODO" src

# List all routes
find src/app -name 'page.tsx' -o -name 'route.ts'

# Check TypeScript errors
npx tsc --noEmit

# Pretty print package.json
cat package.json | jq .
```

## 🎯 Common Workflows

### Starting Fresh

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

### After Schema Changes

```bash
npx prisma generate
npx prisma db push
# Or for production:
npx prisma migrate dev --name your_change
```

### Before Committing

```bash
npm run lint
npm run type-check
npm run format
npm run build
git add .
git commit -m "Your message"
```

### Deploying to Production

```bash
# 1. Test locally
npm run build
npm run start

# 2. Commit changes
git add .
git commit -m "Ready for deployment"
git push

# 3. Deploy (Vercel auto-deploys from GitHub)
# Or manually:
vercel --prod
```

## 🆘 Troubleshooting

```bash
# Database connection issues
npx prisma studio  # Test if you can connect

# Build errors
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build

# Type errors
npm run type-check

# Prisma Client issues
npx prisma generate

# Port already in use
lsof -ti:3000 | xargs kill -9

# Clear everything and start fresh
rm -rf node_modules .next
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npm run dev
```

---

**💡 Tip:** Bookmark this file for quick reference!
