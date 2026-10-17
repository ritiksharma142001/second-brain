#!/bin/bash

# Second Brain - One-Click Setup & Run Script
# This script will install everything and start your blog platform

set -e  # Exit on any error

echo "🚀 Second Brain - One-Click Setup & Run"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed!"
    echo ""
    echo "Install PostgreSQL:"
    echo "  macOS:   brew install postgresql@16"
    echo "  Ubuntu:  sudo apt install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

print_success "PostgreSQL detected"

# Check if database exists, create if not
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w secondbrain | wc -l)
if [ $DB_EXISTS -eq 0 ]; then
    print_info "Creating database 'secondbrain'..."
    createdb secondbrain 2>/dev/null || psql -U postgres -c "CREATE DATABASE secondbrain;" 2>/dev/null || true
    print_success "Database created"
else
    print_success "Database 'secondbrain' exists"
fi

# Check if .env exists
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        
        # Generate a random secret
        if command -v openssl &> /dev/null; then
            SECRET=$(openssl rand -base64 32)
            sed -i.bak "s|NEXTAUTH_SECRET=\".*\"|NEXTAUTH_SECRET=\"$SECRET\"|g" .env
            rm .env.bak 2>/dev/null || true
        fi
        
        print_success ".env file created"
        print_info "⚠️  Please update EMAIL settings in .env for magic link to work"
    else
        print_error ".env.example not found!"
        exit 1
    fi
else
    print_success ".env file exists"
fi

# Install dependencies
print_info "Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps --silent
print_success "Dependencies installed"

# Generate Prisma Client
print_info "Generating Prisma Client..."
npx prisma generate --silent
print_success "Prisma Client generated"

# Push database schema
print_info "Setting up database schema..."
npx prisma migrate deploy
print_success "Database schema ready"

# Seed database
print_info "Seeding database with sample data..."
npx prisma db seed
print_success "Database seeded"

# Clear terminal
clear

# Success message
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Setup Complete! 🎉"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Starting development server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_info "Local URL:  http://localhost:3000"
print_info "Admin:      http://localhost:3000/admin"
print_info "Sign in:    http://localhost:3000/auth/signin"
echo ""
print_info "Default admin: admin@example.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait a bit before starting
sleep 2

# Open browser (cross-platform)
if command -v xdg-open &> /dev/null; then
    # Linux
    (sleep 5 && xdg-open http://localhost:3000) &
elif command -v open &> /dev/null; then
    # macOS
    (sleep 5 && open http://localhost:3000) &
elif command -v start &> /dev/null; then
    # Windows
    (sleep 5 && start http://localhost:3000) &
fi

# Start the development server
npm run dev
