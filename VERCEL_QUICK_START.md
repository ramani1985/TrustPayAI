# 🚀 Vercel Quick Start Guide

## TL;DR - Deploy in 5 Minutes

### 1. Prepare Your Project
```bash
# Run the deployment check script
./deploy.sh  # Linux/Mac
# or
deploy.bat   # Windows
```

### 2. Deploy Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Root Directory**: `backend`
5. **Framework**: `Next.js`
6. **Environment Variables**:
   ```
   GEMINI_API_KEY=your_key_here
   STRIPE_SECRET_KEY=your_key_here
   PAYPAL_CLIENT_ID=your_key_here
   PAYPAL_CLIENT_SECRET=your_key_here
   PAYPAL_MODE=sandbox
   ```
7. Click "Deploy"

### 3. Deploy Frontend
1. Create another Vercel project
2. **Root Directory**: `frontend`
3. **Framework**: `Vite`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-app.vercel.app
   ```
5. Click "Deploy"

### 4. Test Your Deployment
- Backend: `https://your-backend-app.vercel.app/api/health`
- Frontend: `https://your-frontend-app.vercel.app`

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| "Html should not be imported" | ✅ Fixed - App Router structure is now correct |
| Build fails | Check environment variables are set |
| CORS errors | ✅ Fixed - CORS is configured in next.config.js |
| Frontend can't reach backend | Update VITE_API_URL to your backend URL |

## 📚 Full Documentation
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🆘 Need Help?
1. Check the troubleshooting section in DEPLOYMENT.md
2. Verify all environment variables are set
3. Test builds locally with `npm run build`
