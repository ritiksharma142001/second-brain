# Second Brain - Project Overview

**Tagline:** Capture Ideas. Share Knowledge.

A modern, production-ready blogging platform built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

---

## 🎯 What is Second Brain?

Second Brain is a **complete, enterprise-grade blogging platform** that allows users to:

- **Read** blog articles with beautiful, responsive design
- **Write** rich content using a powerful editor (Tiptap)
- **Engage** through comments, likes, and bookmarks
- **Discover** content via search, categories, and tags
- **Manage** everything through an admin dashboard

It's called "Second Brain" because it helps you capture, organize, and share knowledge - like an extension of your mind.

---

## ✨ Key Features

### For Readers (Public Users)
- 📖 **Browse Articles** - Clean, medium-style reading experience
- 🔍 **Search & Filter** - Find content by category, tags, or keywords
- 💬 **Comment & Discuss** - Engage with nested comment threads
- 🌓 **Dark Mode** - Switch between light and dark themes
- 📱 **Responsive** - Perfect on mobile, tablet, and desktop
- 🔖 **Bookmark** - Save articles for later reading

### For Authors (Authenticated Users)
- 🔐 **Magic Link Login** - No passwords, just email links
- ✍️ **Rich Editor** - Tiptap editor with markdown, images, code blocks
- 💬 **Comment** - Reply to readers and other authors
- ❤️ **Like & Save** - Bookmark favorite articles
- 📊 **Reading History** - Track what you've read
- 👤 **Profile Management** - Update name, bio, and avatar

### For Admins
- 📝 **Content Management** - Create, edit, publish, schedule posts
- 🎨 **Rich Text Editor** - Full-featured Tiptap editor
- 📁 **Organize** - Manage categories and tags
- 👥 **User Management** - View and manage all users
- 🛡️ **Moderation** - Delete inappropriate comments
- 📈 **Analytics** - View stats (posts, users, views, engagement)
- 🎯 **Featured Posts** - Pin and feature important articles
- 📢 **Announcements** - Create site-wide announcements

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend:**
- **Next.js 16.2** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Modern icon library

**Backend:**
- **Next.js API Routes** - Serverless API endpoints
- **Server Actions** - Type-safe server mutations
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **Zod** - Runtime type validation

**Authentication:**
- **NextAuth.js v5** - Authentication system
- **Magic Links** - Passwordless email authentication
- **Role-Based Access** - Admin and User roles
- **Session Management** - Secure database sessions

**Additional Tools:**
- **Tiptap** - Rich text editor
- **UploadThing** - File upload service
- **Nodemailer** - Email sending
- **React Hook Form** - Form management
- **React Email** - Email templates
- **date-fns** - Date utilities

**DevOps:**
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment platform
- **ESLint & Prettier** - Code quality
- **Husky** - Git hooks

### Project Structure

```
second-brain/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # Admin dashboard routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (public)/          # Public blog pages
│   │   ├── api/               # API endpoints
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # React components
│   │   ├── features/          # Feature-specific components
│   │   ├── layout/            # Layout components
│   │   ├── providers/         # Context providers
│   │   ├── shared/            # Shared components
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/                   # Core library
│   │   ├── actions/           # Server actions
│   │   ├── hooks/             # Custom React hooks
│   │   ├── validations/       # Zod schemas
│   │   ├── auth.ts            # Authentication config
│   │   ├── db.ts              # Database client
│   │   └── utils.ts           # Utility functions
│   │
│   ├── types/                 # TypeScript types
│   ├── config/                # Configuration files
│   ├── services/              # Business logic
│   ├── emails/                # Email templates
│   └── middleware.ts          # Route protection
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
│
├── public/                    # Static assets
├── .github/workflows/         # CI/CD
└── Documentation files        # Guides and docs
```

---

## 🗄️ Database Schema

### Core Models

**User**
- Stores user information, email, role (ADMIN/USER)
- Handles authentication via NextAuth
- Links to posts, comments, bookmarks, etc.

**Post**
- Blog articles with title, content, cover image
- Status: DRAFT, PUBLISHED, SCHEDULED


---

## 🔒 Security

### Authentication Security
- ✅ Magic links expire after use
- ✅ Secure session tokens
- ✅ CSRF protection built-in
- ✅ Role-based access control

### Data Protection
- ✅ Input validation with Zod
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection
- ✅ HTML sanitization for user content
- ✅ Rate limiting (to be implemented)

### Best Practices
- ✅ Environment variables for secrets
- ✅ HTTPS in production
- ✅ Secure headers
- ✅ No sensitive data in client code

---

## 📊 API Endpoints

### Public Endpoints
```
GET  /api/posts              # Get all published posts
GET  /api/posts/[slug]       # Get single post by slug
GET  /api/categories         # Get all categories
GET  /api/tags               # Get all tags
GET  /api/search?q=query     # Search posts
```

### Protected Endpoints
```
POST /api/posts              # Create post (Admin)
PUT  /api/posts/[id]         # Update post (Admin)
DELETE /api/posts/[id]       # Delete post (Admin)

POST /api/comments           # Create comment (Auth required)
PUT  /api/comments/[id]      # Update comment (Owner/Admin)
DELETE /api/comments/[id]    # Delete comment (Owner/Admin)

POST /api/bookmarks          # Bookmark post (Auth required)
DELETE /api/bookmarks/[id]   # Remove bookmark (Auth required)
```

### Authentication
```
POST /api/auth/signin        # Send magic link
GET  /api/auth/callback      # Verify magic link
POST /api/auth/signout       # Sign out user
```

---

## 🔄 Data Flow

### Reading a Blog Post

1. User visits `/blog/[slug]`
2. Server Component fetches post from database
3. Post rendered with metadata
4. View count incremented
5. Comments fetched and displayed
6. Related posts suggested

### Creating a Post (Admin)

1. Admin goes to `/admin/posts/new`
2. Fills form with title, content, etc.
3. Clicks "Publish"
4. Server Action validates data
5. Post created in database
6. Page revalidated
7. Redirect to post page

### Commenting

1. User writes comment
2. Form submitted with validation
3. Server Action checks authentication
4. Comment created in database
5. UI updated with new comment
6. Email notification sent (future)

---

## 📈 Analytics & Insights

### User Metrics
- Total users registered
- Active users (last 30 days)
- New signups per day

### Content Metrics
- Total posts published
- Posts by status (draft/published)
- Average reading time
- Most viewed posts
- Most commented posts

### Engagement Metrics
- Total comments
- Comments per post average
- Total bookmarks
- Engagement rate

---

## 🛠️ Development Workflow

### Local Development
```bash
# 1. Start PostgreSQL
brew services start postgresql@16

# 2. Start dev server
npm run dev

# 3. Open Prisma Studio (optional)
npx prisma studio

# 4. Make changes
# Edit files in src/

# 5. Test
# Visit http://localhost:3000
```

### Making Database Changes
```bash
# 1. Edit schema
nano prisma/schema.prisma

# 2. Generate client
npx prisma generate

# 3. Push to database
npx prisma db push

# 4. Test changes
npm run dev
```

### Adding a New Page
```bash
# Create file
touch src/app/(public)/about/page.tsx

# Add content
# export default function AboutPage() { ... }

# Visit page
# http://localhost:3000/about
```

### Adding a Component
```bash
# Create component
touch src/components/features/MyComponent.tsx

# Import and use
# import { MyComponent } from '@/components/features/MyComponent'
```

---

## 🧪 Testing (Future)

### Unit Tests
- Component testing with Jest
- Utility function tests
- Validation schema tests

### Integration Tests
- API endpoint testing
- Database operation tests
- Authentication flow tests

### E2E Tests
- Critical user journeys
- Admin workflows
- Form submissions

---

## 🚀 Deployment Strategy

### Development
- Local PostgreSQL database
- Hot reload with Fast Refresh
- Development mode logging
- Prisma Studio for DB inspection

### Staging (Optional)
- Separate Vercel environment
- Staging database (Neon)
- Test with production data
- QA testing

### Production
- Vercel deployment
- Production database (Neon)
- Environment variables
- SSL/HTTPS automatic
- CDN for static assets
- Auto-scaling

---

## 📦 Dependencies Overview

### Core (Production)
- `next@16.2.12` - Framework
- `react@19.2.4` - UI library
- `typescript@5` - Type safety
- `@prisma/client@6.5.0` - Database
- `next-auth@5.0.0-beta.25` - Auth
- `zod@3.24.1` - Validation

### UI & Styling
- `tailwindcss@4` - Styling
- `@radix-ui/*` - UI primitives
- `framer-motion@12.16.1` - Animations
- `lucide-react@0.468.0` - Icons

### Editor & Forms
- `@tiptap/react@2.10.4` - Editor
- `react-hook-form@7.54.2` - Forms
- `@tanstack/react-query@5.62.12` - Data fetching

### Development
- `eslint@9` - Linting
- `prettier@3.4.2` - Formatting
- `prisma@6.5.0` - DB toolkit
- `husky@9.1.7` - Git hooks
- `tsx@4.19.2` - TypeScript execution

---

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### Authentication
- [NextAuth.js Docs](https://authjs.dev)
- [Auth.js Guide](https://authjs.dev/getting-started)

### UI Components
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (if applicable)
5. Submit a pull request

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Internationalization

---

## 📝 Roadmap

### Phase 1: MVP (Current)
- [x] Core infrastructure
- [x] Authentication system
- [x] Basic blog reading
- [x] Admin dashboard
- [ ] Rich text editor
- [ ] Comments UI
- [ ] Search functionality

### Phase 2: Enhancement
- [ ] Advanced search with filters
- [ ] User profiles
- [ ] Newsletter system
- [ ] Email notifications
- [ ] Social sharing
- [ ] Reading progress indicator

### Phase 3: Advanced Features
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Content scheduling
- [ ] Collaborative editing
- [ ] API for third-party apps
- [ ] Mobile app (React Native)

### Phase 4: Scale
- [ ] Performance optimizations
- [ ] CDN integration
- [ ] Redis caching
- [ ] Elasticsearch integration
- [ ] Load testing
- [ ] Auto-scaling setup

---

## ❓ FAQ

**Q: Can I use this for commercial projects?**
A: Yes! MIT license allows commercial use.

**Q: Do I need to know TypeScript?**
A: Recommended but not required. You can learn as you go.

**Q: Can I customize the design?**
A: Absolutely! Edit Tailwind config and components.

**Q: How do I add more features?**
A: See TODO.md for a checklist of features to build.

**Q: Is this production-ready?**
A: The foundation is 100% production-ready. Some features need to be built (see TODO.md).

**Q: What database should I use?**
A: PostgreSQL is recommended. Neon (free) or Supabase work great.

**Q: Can I deploy to other platforms?**
A: Yes! Works on Vercel, Netlify, AWS, or any Node.js host.

**Q: How do I get support?**
A: Open an issue on GitHub or check the documentation.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source projects:
- [Next.js](https://nextjs.org) by Vercel
- [React](https://react.dev) by Meta
- [Prisma](https://prisma.io)
- [NextAuth.js](https://authjs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) by shadcn
- [Radix UI](https://radix-ui.com)
- [Tiptap](https://tiptap.dev)

---

**Built with ❤️ for the developer community**

**Second Brain** - Capture Ideas. Share Knowledge.

- Belongs to author (User)
- Has category, tags, comments

**Category**
- Organizes posts into topics (Technology, Programming, etc.)
- Has name, slug, description, color, icon

**Tag**
- Flexible labeling system for posts
- Simple name and slug

**Comment**
- Nested comment system with unlimited depth
- Has replies (parent-child relationship)
- Can be liked by users
- Moderated by admins

**CommentLike**
- Tracks which users liked which comments
- Prevents duplicate likes

**Bookmark**
- Users can save posts for later
- One bookmark per user per post

**ViewHistory**
- Tracks reading history
- Records when user viewed a post

**Newsletter**
- Email subscriber management
- Tracks subscription status

**Notification**
- User notifications system
- For comment replies, new posts, etc.

**Media**
- Tracks uploaded files
- Links to posts

**Announcement**
- Site-wide announcements
- Can be activated/deactivated
- Has expiration date

### Relationships

```
User (1) ─── (many) Post
User (1) ─── (many) Comment
User (1) ─── (many) Bookmark
User (1) ─── (many) ViewHistory

Post (1) ─── (many) Comment
Post (1) ─── (1) Category
Post (many) ─── (many) Tag

Comment (1) ─── (many) Comment (replies)
Comment (1) ─── (many) CommentLike
```

---

## 🔐 Authentication Flow

### Magic Link Authentication

1. **User enters email** on signin page
2. **Server generates secure token** and sends email
3. **User clicks link** in email
4. **Token verified** and session created
5. **User redirected** to dashboard

**Benefits:**
- ✅ No passwords to remember
- ✅ No password leaks
- ✅ Secure by default
- ✅ Better user experience

### Authorization

**Roles:**
- **USER** - Can read, comment, bookmark
- **ADMIN** - Full access to everything

**Protected Routes:**
- `/admin/*` - Admin only
- `/dashboard/*` - Authenticated users only
- Middleware checks on every request

---

## 🎨 Design System

### Color Palette

**Light Mode:**
- Background: White (#FFFFFF)
- Foreground: Dark Gray (#0A0A0A)
- Primary: Black (#000000)
- Accent: Blue (#3B82F6)

**Dark Mode:**
- Background: Dark Gray (#0A0A0A)
- Foreground: Light Gray (#EDEDED)
- Primary: White (#FFFFFF)
- Accent: Blue (#3B82F6)

### Typography

- **Font Family:** Inter (system font fallback)
- **Headings:** Bold, large sizes
- **Body:** Regular weight, readable line height
- **Code:** Monospace font for code blocks

### Components

All components built with:
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first styling
- **CVA** - Component variance authority
- **Consistent spacing** - 4px/8px grid system

---

## 🚀 Performance

### Optimizations

**Server Components:**
- Most components are Server Components
- Reduced JavaScript bundle size
- Faster initial page load

**Image Optimization:**
- Next.js Image component
- Automatic WebP conversion
- Lazy loading
- Responsive images

**Code Splitting:**
- Automatic route-based splitting
- Dynamic imports where needed
- Optimized bundle sizes

**Database:**
- Proper indexes on all queries
- Connection pooling
- Efficient queries with Prisma

**Caching:**
- Revalidation on data changes
- Static generation where possible
- ISR for frequently updated content

