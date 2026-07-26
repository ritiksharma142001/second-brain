@echo off
REM Second Brain - One-Click Setup & Run Script for Windows
REM This script will install everything and start your blog platform

echo.
echo ================================
echo Second Brain - One-Click Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected
node -v

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed!
    echo.
    echo Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [OK] PostgreSQL detected

REM Check if database exists
psql -U postgres -lqt | findstr /C:"secondbrain" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Creating database 'secondbrain'...
    psql -U postgres -c "CREATE DATABASE secondbrain;"
    echo [OK] Database created
) else (
    echo [OK] Database 'secondbrain' exists
)

REM Check if .env exists
if not exist .env (
    echo [INFO] Creating .env file...
    if exist .env.example (
        copy .env.example .env
        echo [OK] .env file created
        echo [WARNING] Please update EMAIL settings in .env for magic link to work
    ) else (
        echo [ERROR] .env.example not found!
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file exists
)

REM Install dependencies
echo.
echo [INFO] Installing dependencies (this may take a few minutes)...
call npm install --legacy-peer-deps --silent
echo [OK] Dependencies installed

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate
echo [OK] Prisma Client generated

REM Push database schema
echo [INFO] Setting up database schema...
call npx prisma db push --accept-data-loss --skip-generate
echo [OK] Database schema ready

REM Seed database
echo [INFO] Seeding database with sample data...
call npx prisma db seed
echo [OK] Database seeded

REM Clear screen
cls

REM Success message
echo.
echo ========================================
echo.
echo [SUCCESS] Setup Complete! 
echo.
echo ========================================
echo.
echo Starting development server...
echo.
echo ========================================
echo.
echo Local URL:  http://localhost:3000
echo Admin:      http://localhost:3000/admin
echo Sign in:    http://localhost:3000/auth/signin
echo.
echo Default admin: admin@example.com
echo.
echo ========================================
echo.

REM Wait a bit then open browser
timeout /t 5 /nobreak >nul
start http://localhost:3000

REM Start the development server
call npm run dev
