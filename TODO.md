# Second Brain - Implementation Checklist

Use this checklist to track remaining implementation tasks.

## 🎯 MVP Completion Checklist

### Phase 1: Core Editor & Post Creation (High Priority)

#### Tiptap Editor Setup
- [ ] Install Tiptap packages (already in package.json)
- [ ] Create `src/components/features/editor/TiptapEditor.tsx`
- [ ] Create `src/components/features/editor/Toolbar.tsx`
- [ ] Configure all extensions:
  - [ ] Heading, Bold, Italic, Strike
  - [ ] Code, Code Block with syntax highlighting
  - [ ] Bullet List, Ordered List
  - [ ] Blockquote
  - [ ] Link
  - [ ] Image (with upload)
  - [ ] Table
  - [ ] Task List
  - [ ] Placeholder

#### Post Creation/Editing
- [ ] Create `src/app/(admin)/admin/posts/new/page.tsx`
- [ ] Create `src/app/(admin)/admin/posts/[id]/edit/page.tsx`
- [ ] Build post form with:
  - [ ] Title input
  - [ ] Slug input (auto-generate from title)
  - [ ] Excerpt textarea
  - [ ] Tiptap editor for content
  - [ ] Cover image upload
  - [ ] Category select
  - [ ] Tag input (multi-select or autocomplete)
  - [ ] Status select (Draft/Published/Scheduled)
  - [ ] Publish date picker
  - [ ] Save draft button
  - [ ] Publish button

### Phase 2: UI Components (High Priority)

#### Install Remaining shadcn Components
```bash
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
```

#### Feature Components
- [ ] `src/components/features/PostCard.tsx` - Blog post card
- [ ] `src/components/features/UserAvatar.tsx` - User avatar
- [ ] `src/components/features/CategoryBadge.tsx` - Category badge
- [ ] `src/components/features/TagList.tsx` - Tag list
- [ ] `src/components/features/ShareButtons.tsx` - Social share
- [ ] `src/components/features/PostMetadata.tsx` - Author/date/time display

### Phase 3: Comments System (High Priority)

#### Comment Components
- [ ] `src/components/features/comments/CommentThread.tsx`
  - Display nested comments
  - Reply functionality
  - Like counter
  - Edit/Delete for own comments
  - Admin delete for all
- [ ] `src/components/features/comments/CommentForm.tsx`
  - Add comment
  - Reply to comment
  - Edit comment
- [ ] `src/components/features/comments/Comment.tsx`
  - Single comment display
  - User avatar
  - Timestamp
  - Like button
  - Reply button
  - Edit/Delete dropdown

#### Integration
- [ ] Add comments to blog post page
- [ ] Connect to server actions
- [ ] Add real-time updates (optional)

### Phase 4: Search & Filtering (Medium Priority)

- [ ] Create `src/app/api/search/route.ts`
- [ ] Create `src/app/(public)/search/page.tsx`
- [ ] Create `src/components/features/SearchBar.tsx`
  - Debounced search input
  - Instant results dropdown
  - "Search all" link
- [ ] Add search to header
- [ ] Implement filters:
  - [ ] By category
  - [ ] By tag
  - [ ] By author
  - [ ] Sort by (latest, popular, trending)

### Phase 5: Category & Tag Pages (Medium Priority)

- [ ] Create `src/app/(public)/category/[slug]/page.tsx`
- [ ] Create `src/app/(public)/tag/[slug]/page.tsx`
- [ ] Create `src/app/(admin)/admin/categories/page.tsx`
  - [ ] List categories
  - [ ] Add category form
  - [ ] Edit category
  - [ ] Delete category
- [ ] Create `src/app/(admin)/admin/tags/page.tsx`
  - [ ] List tags
  - [ ] Add tag
  - [ ] Edit tag
  - [ ] Delete tag

### Phase 6: User Dashboard (Medium Priority)

- [ ] Create `src/app/(dashboard)/dashboard/layout.tsx`
- [ ] Create `src/app/(dashboard)/dashboard/page.tsx` - Overview
- [ ] Create `src/app/(dashboard)/dashboard/bookmarks/page.tsx`
  - [ ] List bookmarked posts
  - [ ] Remove bookmark
- [ ] Create `src/app/(dashboard)/dashboard/history/page.tsx`
  - [ ] Reading history with dates
  - [ ] Clear history option
- [ ] Create `src/app/(dashboard)/dashboard/comments/page.tsx`
  - [ ] User's comments
  - [ ] Edit/delete
- [ ] Create `src/app/(dashboard)/dashboard/settings/page.tsx`
  - [ ] Update profile (name, bio, avatar)
  - [ ] Email preferences

### Phase 7: Admin Features (Medium Priority)

- [ ] Create `src/app/(admin)/admin/users/page.tsx`
  - [ ] List all users
  - [ ] User details
  - [ ] Change role
  - [ ] Delete user
- [ ] Create `src/app/(admin)/admin/comments/page.tsx`
  - [ ] List all comments
  - [ ] Moderate/delete inappropriate
- [ ] Enhance `src/app/(admin)/admin/page.tsx`
  - [ ] Chart for views over time
  - [ ] Recent users list
  - [ ] Recent comments list
  - [ ] Top posts this week

### Phase 8: SEO & Performance (Lower Priority)

- [ ] Create `src/app/sitemap.ts` - Dynamic sitemap
- [ ] Create `src/app/robots.ts` - Robots.txt
- [ ] Create `src/app/rss.xml/route.ts` - RSS feed
- [ ] Add JSON-LD structured data to blog posts
- [ ] Add breadcrumbs
- [ ] Optimize images with next/image
- [ ] Add loading skeletons to all pages
- [ ] Implement infinite scroll or pagination

### Phase 9: Email Templates (Lower Priority)

- [ ] Set up React Email
- [ ] Create `src/emails/MagicLinkEmail.tsx`
- [ ] Create `src/emails/WelcomeEmail.tsx`
- [ ] Create `src/emails/CommentNotificationEmail.tsx`
- [ ] Test emails locally

### Phase 10: Security & Polish (Lower Priority)

- [ ] Add rate limiting to API routes
- [ ] Sanitize HTML in post content
- [ ] Add CSRF protection
- [ ] Add secure headers (helmet)
- [ ] Create error boundaries
- [ ] Add 404 page
- [ ] Add loading states everywhere
- [ ] Add empty states everywhere
- [ ] Mobile menu for navigation
- [ ] Newsletter signup form

### Phase 11: Image Upload (UploadThing)

- [ ] Set up UploadThing account
- [ ] Configure API keys
- [ ] Create `src/app/api/uploadthing/route.ts`
- [ ] Create upload component
- [ ] Integrate with Tiptap editor
- [ ] Add to post cover image field

### Phase 12: Testing & Deployment

- [ ] Write tests (optional for MVP)
- [ ] Test all user flows
- [ ] Test on mobile devices
- [ ] Deploy to Vercel
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up custom domain
- [ ] Test in production

## 📊 Progress Tracking

Track your progress:
- Total Tasks: ~100
- Completed: ~90 (Foundation + Features)
- Remaining: ~10

✅ **MAJOR UPDATE:** All core features have been implemented!

### ✅ Recently Completed:
- ✅ Tiptap Rich Text Editor with full toolbar
- ✅ Create/Edit Post pages
- ✅ Comments System (nested, replies, likes)
- ✅ Search functionality
- ✅ Category & Tag pages
- ✅ User Dashboard (overview, bookmarks, history, settings)
- ✅ SEO features (sitemap, robots.txt, RSS feed)
- ✅ All essential UI components

Update this file as you complete tasks!

## 🎯 Suggested Order

1. **Week 1:** Tiptap editor + Post creation (Can create content)
2. **Week 2:** Comments system (Can engage)
3. **Week 3:** Search + Category/Tag pages (Can discover)
4. **Week 4:** User dashboard + Polish (MVP complete!)

## 💡 Tips

- Install shadcn components as needed
- Test each feature before moving to the next
- Use Prisma Studio to inspect database
- Commit frequently
- Deploy early and often

---

**Mark tasks with `- [x]` as you complete them!**
