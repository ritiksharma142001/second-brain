# 👉 WHAT TO DO NOW

## Step 1️⃣: Run the Setup Script

Open your terminal in this folder and run:

### **macOS / Linux:**
```bash
./setup-and-run.sh
```

### **Windows:**
```cmd
setup-and-run.bat
```

**That's it!** Wait 2-3 minutes and your blog will open in the browser.

---

## Step 2️⃣: Sign In as Admin

When the browser opens:

1. Click "Sign In" in the header
2. Enter: `admin@example.com`
3. Check your **terminal/console** for the magic link
4. Click the link or copy/paste it
5. You're now signed in as admin!

---

## Step 3️⃣: Create Your First Post

1. Click "Admin" in the header
2. Click "New Post" button
3. Write an amazing post with the rich editor:
   - Add headings
   - Make text **bold** or *italic*
   - Insert images
   - Create lists
   - Add code blocks
4. Click "Publish Now"
5. View your post on the blog!

---

## Step 4️⃣: Explore All Features

### Try These:
- ✅ **Comment** on a post
- ✅ **Reply** to a comment
- ✅ **Like** a comment
- ✅ **Bookmark** a post
- ✅ **Search** for content
- ✅ **Filter** by category
- ✅ **Share** a post
- ✅ **Toggle** dark mode
- ✅ **View** dashboard
- ✅ **Test** mobile menu
- ✅ **Manage** categories (Admin → Categories)
- ✅ **Manage** tags (Admin → Tags)
- ✅ **Manage** users (Admin → Users)
- ✅ **Moderate** comments (Admin → Comments)

---

## Step 5️⃣: Customize Your Blog

### Edit Site Info:
Open `src/config/site.ts` and change:
- Site name
- Description
- URLs
- Social links

### Edit Colors:
Open `src/app/globals.css` and modify CSS variables

---

## Step 6️⃣: Deploy to Production (Optional)

When ready to go live:

1. Open **QUICK_START.md**
2. Follow the deployment guide
3. Deploy to Vercel (free!)
4. Go live in 30 minutes

---

## 📱 Important URLs

Once running, visit these:

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Blog | http://localhost:3000/blog |
| Admin Dashboard | http://localhost:3000/admin |
| User Dashboard | http://localhost:3000/dashboard |
| Sign In | http://localhost:3000/auth/signin |
| Search | http://localhost:3000/search |
| Categories | http://localhost:3000/admin/categories |
| Tags | http://localhost:3000/admin/tags |
| Users | http://localhost:3000/admin/users |
| Comments | http://localhost:3000/admin/comments |

---

## 🎮 Quick Commands

```bash
# Start dev server (if not running)
npm run dev

# View database in GUI
npx prisma studio

# Reset database
npx prisma db push --force-reset
npx prisma db seed

# Check for errors
npm run lint

# Build for production (test)
npm run build
```

---

## 🛟 Help! Something's Wrong

### Script won't run?
```bash
# Make it executable (macOS/Linux)
chmod +x setup-and-run.sh
```

### PostgreSQL error?
Make sure PostgreSQL is installed and running:
```bash
# macOS
brew services start postgresql@16

# Check if running
psql --version
```

### Port 3000 already in use?
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Emails not working?
In development, emails are shown in the **console/terminal**.
Look for the magic link there!

For production emails, update `.env`:
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

---

## 📚 Documentation

| File | What it's for |
|------|---------------|
| **ONE_COMMAND_SETUP.md** | Detailed setup guide |
| **TESTING_GUIDE.md** | Test all features |
| **QUICK_START.md** | Deploy to production |
| **README.md** | Full documentation |
| **100_PERCENT_COMPLETE.md** | Complete feature list |

---

## 🎯 Next Steps Checklist

- [ ] Run setup script
- [ ] Sign in as admin
- [ ] Create first post
- [ ] Test commenting
- [ ] Try search
- [ ] Test mobile view
- [ ] Customize branding
- [ ] Add your content
- [ ] (Optional) Deploy to production

---

## 🎉 You're Ready!

Everything is set up and working. Now **create amazing content** and share your knowledge with the world!

**Need more help?** Check the documentation files above.

**Happy blogging!** 🚀
