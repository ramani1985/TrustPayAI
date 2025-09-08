@echo off
REM TrustPay AI Deployment Script for Windows
REM This script helps prepare the project for Vercel deployment

echo 🚀 TrustPay AI Deployment Preparation
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

echo 📋 Pre-deployment checks...

REM Check if backend has required files
echo 🔍 Checking backend structure...
if not exist "backend\src\app\layout.tsx" (
    echo ❌ Missing: backend\src\app\layout.tsx
    exit /b 1
)

if not exist "backend\src\app\page.tsx" (
    echo ❌ Missing: backend\src\app\page.tsx
    exit /b 1
)

REM Check if frontend has required files
echo 🔍 Checking frontend structure...
if not exist "frontend\src\vite-env.d.ts" (
    echo ❌ Missing: frontend\src\vite-env.d.ts
    exit /b 1
)

REM Test builds
echo 🔨 Testing backend build...
cd backend
call npm run build
if errorlevel 1 (
    echo ❌ Backend build failed
    exit /b 1
)
cd ..

echo 🔨 Testing frontend build...
cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
)
cd ..

echo ✅ All checks passed!
echo.
echo 📝 Next steps:
echo 1. Commit and push your changes to GitHub
echo 2. Connect your repository to Vercel
echo 3. Follow the deployment guide in DEPLOYMENT.md
echo 4. Set environment variables in Vercel dashboard
echo.
echo 🎉 Ready for deployment!
pause
