# ⚡ ONE-COMMAND SETUP

## 🚀 Fastest Way to Get Started

Just run **ONE command** and everything will be set up automatically!

---

## Prerequisites (One-time setup)

You only need these two things installed:

1. **Node.js 20+** - [Download](https://nodejs.org/)
2. **PostgreSQL** - [Download](https://www.postgresql.org/download/)

That's it! The script handles everything else.

---

## 🎯 Run This ONE Command

### **macOS / Linux:**

```bash
./setup-and-run.sh
```

### **Windows:**

```cmd
setup-and-run.bat
```

---

## 🎉 What Happens Automatically

The script will:

1. ✅ Check Node.js and PostgreSQL
2. ✅ Create database (`secondbrain`)
3. ✅ Create `.env` file
4. ✅ Install all dependencies
5. ✅ Set up database schema
6. ✅ Seed sample data
7. ✅ Start dev server
8. ✅ **Open browser automatically!**

**Total time: 2-3 minutes**

---

## 🌐 What Opens in Browser

After setup completes, your browser will open to:

**http://localhost:3000**

### Try These URLs:

- **Homepage:** http://localhost:3000
- **Blog:** http://localhost:3000/blog
- **Sign In:** http://localhost:3000/auth/signin
- **Admin:** http://localhost:3000/admin

### Default Login:

**Email:** `admin@example.com`

Use the magic link from your email (check console in development mode).

---

## ⚙️ What if Something Goes Wrong?

### Issue: Permission denied

**macOS/Linux:**
```bash
chmod +x setup-and-run.sh
./setup-and-run.sh
```

### Issue: PostgreSQL not found

**Install PostgreSQL:**

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Issue: Database connection error

Make sure PostgreSQL is running:

**macOS:**
```bash
brew services start postgresql@16
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Windows:**
Start "PostgreSQL" from Services

### Issue: Port 3000 already in use

Kill the process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 📧 Email Configuration (Optional)

For magic link emails to work in production:

1. Open `.env` file
2. Add your email settings:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@secondbrain.com"
```

**For Gmail:**
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use that password in `.env`

In development, emails are shown in the console!

---

## 🎮 What to Do Next

### 1. **Sign In as Admin**
   - Go to http://localhost:3000/auth/signin
   - Use: `admin@example.com`
   - Check console for magic link

### 2. **Create Your First Post**
   - Go to http://localhost:3000/admin
   - Click "New Post"
   - Use the rich editor
   - Publish!

### 3. **Explore Features**
   - Comment on posts
   - Bookmark articles
   - Search content
   - Try dark mode
   - Test mobile view

### 4. **Customize**
   - Edit `src/config/site.ts`
   - Change branding
   - Add your content

### 5. **Deploy to Production**
   - Follow `QUICK_START.md`
   - Deploy to Vercel (free)
   - Go live in 30 minutes!

---

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal

---

## 🔄 Run Again Later

Just run the same command:

```bash
./setup-and-run.sh     # macOS/Linux
setup-and-run.bat      # Windows
```

The script is smart - it only sets up what's missing!

---

## 📚 More Documentation

- **QUICK_START.md** - Full deployment guide
- **TESTING_GUIDE.md** - Test all features
- **100_PERCENT_COMPLETE.md** - Complete feature list
- **README.md** - Full documentation

---

## 🎉 That's It!

**One command. Everything setup. Browser opens. Ready to use!**

Enjoy your new blog platform! 🚀
