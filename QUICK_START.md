# 🚀 Quick Setup Steps

## **Part 1: Local Setup (15 minutes)**

### **1. Install PostgreSQL**

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb secondbrain
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and set password
- Open Command Prompt:
```cmd
psql -U postgres
CREATE DATABASE secondbrain;
\q
```

### **2. Install Dependencies**
```bash
cd /home/ritik/Downloads/next
npm install --legacy-peer-deps
```

### **3. Create .env file**
```bash
cp .env.example .env
```

### **4. Edit .env** (open with any text editor)

Replace these values:

```env
# Database - use this exactly
DATABASE_URL="postgresql://localhost:5432/secondbrain"

# If on Windows with password:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/secondbrain"

# Generate secret - run this command and paste result:
# openssl rand -base64 32
NEXTAUTH_SECRET="paste-generated-secret-here"

# Keep these as is for now
NEXTAUTH_URL="http://localhost:3000"

# Gmail for testing (optional, but recommended)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-gmail@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="noreply@secondbrain.com"

# Leave empty for now
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Turn on 2-Step Verification
3. Search "App passwords"
4. Select "Mail" → Generate
5. Copy 16-character password

### **5. Initialize Database**
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### **6. Run the app**
```bash
npm run dev
```

### **7. Visit http://localhost:3000**

### **8. Sign in**
- Go to http://localhost:3000/auth/signin
- Enter: `admin@example.com`
- Check your email for magic link
- Click the link
- You're now admin!

---

## **Part 2: Push to GitHub (5 minutes)**

### **1. Create GitHub repo**
- Go to https://github.com
- Click "New repository"
- Name: `second-brain`
- **Public** or Private
- **Don't** initialize with README
- Click "Create"

### **2. Push code**
```bash
git remote add origin https://github.com/YOUR-USERNAME/second-brain.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## **Part 3: Deploy to Vercel (10 minutes)**

### **1. Create Neon Database (FREE)**
- Go to https://neon.tech
- Sign up
- Click "Create Project"
- Name: `second-brain`
- **Copy the connection string** - looks like:
  ```
  postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
  ```

### **2. Deploy to Vercel**
- Go to https://vercel.com
- Sign up with GitHub
- Click "Add New" → "Project"
- Import `second-brain` repository
- Click "Import"

### **3. Add Environment Variables in Vercel**

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Paste Neon connection string |
| `NEXTAUTH_URL` | `https://your-vercel-url.vercel.app` (Vercel shows this) |
| `NEXTAUTH_SECRET` | Same as local (from .env) |
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | Your Gmail |
| `EMAIL_SERVER_PASSWORD` | Your app password |
| `EMAIL_FROM` | `noreply@secondbrain.com` |

### **4. Click "Deploy"**

Wait 2-3 minutes.

### **5. Initialize Production Database**
```bash
export DATABASE_URL="paste-neon-connection-string-here"
npx prisma db push
npx prisma db seed
```

### **6. Visit your Vercel URL**

You'll get: `https://second-brain-xxx.vercel.app`

---

## **Part 4: Custom Domain (Optional, 10 minutes)**

### **1. Buy domain**
- Go to https://www.namecheap.com
- Search "secondbrain.com" (or your choice)
- Buy it (~$10/year)

### **2. In Vercel**
- Go to your project → Settings → Domains
- Add domain: `secondbrain.com`
- Vercel shows DNS records

### **3. In Namecheap**
- Domain List → Manage → Advanced DNS
- Add records:
  - Type: `A`, Host: `@`, Value: `76.76.21.21`
  - Type: `CNAME`, Host: `www`, Value: `cname.vercel-dns.com`

### **4. Wait 15-30 minutes for DNS**

### **5. Update NEXTAUTH_URL in Vercel**
- Settings → Environment Variables
- Change `NEXTAUTH_URL` to: `https://secondbrain.com`
- Redeploy

### **6. Visit https://secondbrain.com**

Done! 🎉

---

## That's It!

**Local:** http://localhost:3000  
**Production:** https://second-brain-xxx.vercel.app  
**Custom Domain:** https://secondbrain.com

Sign in as admin with `admin@example.com` and start creating posts!
