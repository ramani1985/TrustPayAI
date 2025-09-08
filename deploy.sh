#!/bin/bash

# TrustPay AI Deployment Script
# This script helps prepare the project for Vercel deployment

echo "🚀 TrustPay AI Deployment Preparation"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checks..."

# Check if backend has required files
echo "🔍 Checking backend structure..."
if [ ! -f "backend/src/app/layout.tsx" ]; then
    echo "❌ Missing: backend/src/app/layout.tsx"
    exit 1
fi

if [ ! -f "backend/src/app/page.tsx" ]; then
    echo "❌ Missing: backend/src/app/page.tsx"
    exit 1
fi

# Check if frontend has required files
echo "🔍 Checking frontend structure..."
if [ ! -f "frontend/src/vite-env.d.ts" ]; then
    echo "❌ Missing: frontend/src/vite-env.d.ts"
    exit 1
fi

# Test builds
echo "🔨 Testing backend build..."
cd backend
if ! npm run build; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

echo "🔨 Testing frontend build..."
cd frontend
if ! npm run build; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ All checks passed!"
echo ""
echo "📝 Next steps:"
echo "1. Commit and push your changes to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Follow the deployment guide in DEPLOYMENT.md"
echo "4. Set environment variables in Vercel dashboard"
echo ""
echo "🎉 Ready for deployment!"
