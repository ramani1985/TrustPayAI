# Vercel Deployment Guide for TrustPay AI

## Project Structure
This is a monorepo with:
- **Backend**: Next.js 14.2.32 with App Router (port 3001)
- **Frontend**: Vite 4.5.14 React app (port 3000)

## 🚀 Deployment Options

### Option 1: Deploy Backend and Frontend Separately (Recommended)

#### Deploy Backend to Vercel:
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Project Settings**:
   - **Root Directory**: `backend`
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. **Environment Variables** (add in Vercel dashboard):
   ```
   GEMINI_API_KEY=your_gemini_api_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox
   ```
4. **Deploy**: Click "Deploy" and wait for build to complete

#### Deploy Frontend to Vercel:
1. **Create New Project**: Create a separate Vercel project
2. **Project Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-app.vercel.app
   ```
4. **Deploy**: Click "Deploy" and wait for build to complete

### Option 2: Deploy as Monorepo (Advanced)

If you want to deploy both together using the root `vercel.json`:
1. Connect your GitHub repository to Vercel
2. The `vercel.json` file will handle routing between backend and frontend
3. Add all environment variables to the Vercel dashboard
4. Deploy from the root directory

## 📋 Pre-Deployment Checklist

### Backend Checklist:
- [ ] `src/app/layout.tsx` exists (required for App Router)
- [ ] `src/app/page.tsx` exists (root page)
- [ ] All API routes are in `src/app/api/` directory
- [ ] `next.config.js` is properly configured
- [ ] Environment variables are ready

### Frontend Checklist:
- [ ] `vite.config.ts` is properly configured
- [ ] `src/vite-env.d.ts` exists for environment types
- [ ] All dependencies are installed
- [ ] Build command works locally (`npm run build`)

## 🔧 Environment Variables

### Backend Environment Variables
```bash
# Required for Gemini integration
GEMINI_API_KEY=your-gemini-api-key

# Required for Stripe payments
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Required for PayPal payments
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live' for production
```

### Frontend Environment Variables
```bash
# API endpoint for backend
VITE_API_URL=https://your-backend-app.vercel.app
```

## 🐛 Troubleshooting

### Common Issues and Solutions:

#### 1. "Html should not be imported outside of pages/_document" Error
**Solution**: This was fixed by:
- Adding `src/app/layout.tsx` and `src/app/page.tsx` files
- Removing deprecated `appDir` configuration from `next.config.js`
- Ensuring proper App Router structure

#### 2. Build Failures
**Check**:
- All dependencies are installed (`npm install`)
- Environment variables are set in Vercel dashboard
- Build commands work locally
- No TypeScript errors (`npm run build`)

#### 3. CORS Issues
**Solution**: CORS is configured in `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ]
}
```

#### 4. Frontend Can't Connect to Backend
**Solution**:
- Verify `VITE_API_URL` is set correctly
- Check that backend is deployed and accessible
- Ensure CORS is properly configured

#### 5. Environment Variables Not Working
**Solution**:
- Double-check variable names in Vercel dashboard
- Ensure no typos in variable names
- Redeploy after adding new environment variables

## 📊 Post-Deployment Steps

### 1. Test Backend API
```bash
# Test health endpoint
curl https://your-backend-app.vercel.app/api/health

# Test charge endpoint
curl -X POST https://your-backend-app.vercel.app/api/charge \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"USD","source":"tok_test_visa","email":"test@example.com"}'
```

### 2. Test Frontend
- Visit your frontend URL
- Try making a payment
- Check browser console for errors
- Verify API calls are working

### 3. Monitor Performance
- Check Vercel dashboard for build logs
- Monitor function execution times
- Set up error tracking if needed

## 🔄 Continuous Deployment

### Automatic Deployments:
- Push to `main` branch triggers automatic deployment
- Each deployment gets a unique URL for testing
- Production deployments use your custom domain

### Manual Deployments:
- Use Vercel CLI: `vercel --prod`
- Or trigger from Vercel dashboard

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Support

If you encounter issues:
1. Check the build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test locally with `npm run build`
4. Check the troubleshooting section above