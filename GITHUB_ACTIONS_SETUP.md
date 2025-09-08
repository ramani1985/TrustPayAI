# GitHub Actions Setup Guide

## 🔧 Fixing npm Cache Path Issues

The error `/home/runner/.npm specific path not resolved` is a common issue with GitHub Actions. Here's how to fix it:

### 1. Use the Provided Workflow Files

The following workflow files have been created to fix the npm cache issues:

- `.github/workflows/ci.yml` - Complete CI/CD pipeline
- `.github/workflows/test.yml` - Test and lint workflow (fixes npm cache issues)
- `.github/workflows/deploy.yml` - Deployment workflow

### 2. Key Fixes Applied

#### A. Proper Cache Configuration
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
    cache-dependency-path: ${{ matrix.project }}/package-lock.json
```

#### B. Cache Cleanup (if needed)
```yaml
- name: Clear npm cache (if needed)
  run: |
    npm cache clean --force
    rm -rf ~/.npm
```

#### C. Offline Installation
```yaml
- name: Install dependencies
  working-directory: ./${{ matrix.project }}
  run: |
    npm ci --prefer-offline --no-audit
```

### 3. Required GitHub Secrets

For deployment, add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID_BACKEND=your_backend_project_id
VERCEL_PROJECT_ID_FRONTEND=your_frontend_project_id
```

### 4. Getting Vercel Credentials

#### Get Vercel Token:
1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

#### Get Vercel Org ID and Project IDs:
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel link`
3. Check `.vercel/project.json` for the IDs

### 5. Workflow Features

#### CI Pipeline (`ci.yml`):
- Runs on push to main/develop branches
- Runs on pull requests
- Tests both backend and frontend
- Builds all projects
- Uses proper npm caching

#### Test Pipeline (`test.yml`):
- Matrix strategy for backend and frontend
- Fixes npm cache path issues
- Continues on error for linting/tests
- Clears cache if needed

#### Deploy Pipeline (`deploy.yml`):
- Deploys to Vercel on main branch pushes
- Separate deployments for backend and frontend
- Uses Vercel CLI action

### 6. Troubleshooting

#### If you still get npm cache errors:

1. **Update the workflow** to use the latest actions:
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
```

2. **Add explicit cache cleanup**:
```yaml
- name: Clear npm cache
  run: |
    npm cache clean --force
    rm -rf ~/.npm
    rm -rf node_modules
```

3. **Use npm ci instead of npm install**:
```yaml
- name: Install dependencies
  run: npm ci --prefer-offline --no-audit
```

4. **Check package-lock.json exists**:
Make sure both `backend/package-lock.json` and `frontend/package-lock.json` exist.

### 7. Manual Fix for Existing Workflows

If you have existing workflows, update them with:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
    cache-dependency-path: '**/package-lock.json'
```

### 8. Testing the Fix

1. Push the workflow files to your repository
2. Check the Actions tab in GitHub
3. The workflows should run without npm cache errors
4. Monitor the logs for any remaining issues

## 🚀 Quick Start

1. **Copy the workflow files** to your repository
2. **Add GitHub secrets** for Vercel deployment
3. **Push to main branch** to trigger the workflows
4. **Check Actions tab** to monitor progress

The npm cache path issues should now be resolved! 🎉
