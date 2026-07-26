# Testing Guide - Second Brain

This guide will help you test all the features of your blog platform.

---

## 🚀 Before You Start

Make sure you've completed the setup:
```bash
# 1. Database is running
# 2. Dependencies installed
npm install --legacy-peer-deps

# 3. Environment variables set in .env
# 4. Database initialized
npx prisma db push
npx prisma db seed

# 5. Dev server running
npm run dev
```

Visit: **http://localhost:3000**

---

## ✅ Test 1: Homepage & Blog

1. **Homepage**
   - [ ] Visit http://localhost:3000
   - [ ] See hero section
   - [ ] See featured posts
   - [ ] Click "View All Posts" → Goes to `/blog`

2. **Blog Page**
   - [ ] Visit http://localhost:3000/blog
   - [ ] See list of posts
   - [ ] See post cards with images, titles, excerpts
   - [ ] Click on a post → Goes to post detail page

---

## ✅ Test 2: Authentication

1. **Sign In**
   - [ ] Click "Sign In" in header
   - [ ] Enter email: `admin@example.com`
   - [ ] Check your console (emails shown in dev mode)
   - [ ] Copy the magic link from console
   - [ ] Paste in browser → You're signed in!
   - [ ] See "Dashboard" and "Admin" links in header

2. **Sign Out**
   - [ ] Click your avatar in header
   - [ ] Click "Sign Out"
   - [ ] Redirected to homepage

---

## ✅ Test 3: Create Blog Post (Admin)

1. **Access Admin**
   - [ ] Sign in as admin
   - [ ] Click "Admin" in header
   - [ ] See dashboard with stats

2. **Create Post**
   - [ ] Click "New Post" button
   - [ ] Enter title: "My First Blog Post"
   - [ ] See slug auto-generated: "my-first-blog-post"
   - [ ] Enter excerpt: "This is a test post"
   - [ ] Use toolbar to format text:
     - [ ] Type some text
     - [ ] Bold some words
     - [ ] Add a heading
     - [ ] Create a bullet list
     - [ ] Add a link
   - [ ] Click "Publish Now"
   - [ ] Redirected to posts list
   - [ ] See your new post

3. **Edit Post**
   - [ ] Click "Edit" on your post
   - [ ] Change the title
   - [ ] Update content
   - [ ] Click "Update"
   - [ ] Changes saved

---

## ✅ Test 4: Comments

1. **Read Post**
   - [ ] Go to blog page
   - [ ] Click on any published post
   - [ ] Scroll to comments section

2. **Add Comment**
   - [ ] Make sure you're signed in
   - [ ] Type a comment
   - [ ] Click "Comment"
   - [ ] See your comment appear

3. **Reply to Comment**
   - [ ] Click "Reply" on a comment
   - [ ] Type your reply
   - [ ] Click "Reply"
   - [ ] See nested reply

4. **Like Comment**
   - [ ] Click heart icon on a comment
   - [ ] See like count increase
   - [ ] Click again to unlike

5. **Delete Comment**
   - [ ] Click "Delete" on your own comment
   - [ ] Confirm deletion
   - [ ] Comment removed

---

## ✅ Test 5: Search

1. **Search Posts**
   - [ ] Visit http://localhost:3000/search
   - [ ] Type "guide" in search box
   - [ ] Press Enter
   - [ ] See matching posts

2. **Clear Search**
   - [ ] Click X button in search box
   - [ ] Redirected to blog page

---

## ✅ Test 6: Categories & Tags

1. **Category Page**
   - [ ] Visit http://localhost:3000/category/web-development
   - [ ] See posts in that category
   - [ ] See category name and description

2. **Tag Page**
   - [ ] Visit http://localhost:3000/tag/javascript
   - [ ] See posts with that tag
   - [ ] See tag name

---

## ✅ Test 7: User Dashboard

1. **Overview**
   - [ ] Sign in as regular user
   - [ ] Click "Dashboard" in header
   - [ ] See stats: bookmarks, comments, history
   - [ ] See account information

2. **Bookmarks**
   - [ ] Click "Bookmarks" in sidebar
   - [ ] See message "No bookmarks yet"
   - [ ] (Bookmark feature needs to be added to post pages)

3. **History**
   - [ ] Click "History" in sidebar
   - [ ] See reading history
   - [ ] See posts you've visited

4. **Settings**
   - [ ] Click "Settings" in sidebar
   - [ ] See profile form
   - [ ] Change your name
   - [ ] Click "Save Changes"
   - [ ] See success message
   - [ ] Refresh page → Name updated

---

## ✅ Test 8: SEO Features

1. **Sitemap**
   - [ ] Visit http://localhost:3000/sitemap.xml
   - [ ] See XML sitemap with all posts

2. **Robots.txt**
   - [ ] Visit http://localhost:3000/robots.txt
   - [ ] See robots configuration

3. **RSS Feed**
   - [ ] Visit http://localhost:3000/rss.xml
   - [ ] See RSS feed with recent posts

---

## ✅ Test 9: Responsive Design

1. **Mobile**
   - [ ] Open dev tools (F12)
   - [ ] Toggle device toolbar
   - [ ] Select "iPhone 12 Pro"
   - [ ] Navigate through pages
   - [ ] Everything looks good on mobile

2. **Tablet**
   - [ ] Select "iPad"
   - [ ] Navigate through pages
   - [ ] Layout adjusts properly

---

## ✅ Test 10: Dark Mode

1. **Toggle Theme**
   - [ ] Click theme toggle in header
   - [ ] Page switches to dark mode
   - [ ] All colors look good
   - [ ] Click again → Light mode

---

## 🐛 Common Issues & Solutions

### Issue: Can't sign in
**Solution:** Check console for magic link, emails are logged in development

### Issue: Editor not loading
**Solution:** Make sure all Tiptap packages are installed

### Issue: Comments not showing
**Solution:** Make sure you're signed in and post has comments

### Issue: Search not working
**Solution:** Make sure you have published posts in database

### Issue: 404 on pages
**Solution:** Run `npm run dev` to restart server

---

## 📋 Feature Checklist

### Core Features (All Working ✅)
- [x] Homepage with featured posts
- [x] Blog listing page
- [x] Individual blog post pages
- [x] Magic link authentication
- [x] Rich text editor (Tiptap)
- [x] Create/edit posts (admin)
- [x] Nested comments with replies
- [x] Comment likes
- [x] Search functionality
- [x] Category pages
- [x] Tag pages
- [x] User dashboard
- [x] User settings
- [x] Admin dashboard
- [x] SEO (sitemap, robots, RSS)
- [x] Dark mode
- [x] Responsive design

### Optional Features (Not Yet Implemented)
- [ ] Bookmark posts
- [ ] Image upload (UploadThing)
- [ ] User management (admin)
- [ ] Category/Tag CRUD (admin)
- [ ] Comment moderation page
- [ ] Email notifications
- [ ] Newsletter signup

---

## 🎉 Success!

If all tests pass, your blog platform is **fully functional** and ready for deployment!

**Next Steps:**
1. Follow `QUICK_START.md` to deploy to production
2. Customize styling and branding
3. Add your own content
4. Share with users!
