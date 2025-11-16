# Deployment Guide

This guide covers deploying the Fullstack Demo application.

## Frontend Deployment (GitHub Pages)

The frontend is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

### Setup GitHub Pages Deployment

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Configure Repository Secrets:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add the following secret:
     - `VITE_API_URL`: Your production API URL (e.g., `https://api.yourdomain.com`)

3. **Update Base Path (if needed):**

   If your repository is not at the root (e.g., `https://username.github.io/repo-name`), you need to set the base path:

   **Option A: Using GitHub Secrets (Recommended)**
   - Add `VITE_BASE_PATH` secret with value `/your-repo-name`

   **Option B: Update workflow file**
   - Edit `.github/workflows/deploy-frontend.yml`
   - Add to the Build step environment variables:
     ```yaml
     env:
       VITE_API_URL: ${{ secrets.VITE_API_URL }}
       VITE_BASE_PATH: /your-repo-name
     ```

4. **Trigger Deployment:**
   ```bash
   # Make a change to the frontend and push
   git add apps/frontend/
   git commit -m "Deploy frontend to GitHub Pages"
   git push origin main
   ```

5. **Access Your Deployed Site:**
   - Go to **Settings** → **Pages**
   - Your site will be available at: `https://username.github.io/repo-name`
   - Or check the deployment URL in the Actions tab

### Manual Deployment to GitHub Pages

If you want to deploy manually without the workflow:

```bash
# Install gh-pages package
pnpm add -D gh-pages

# Add script to apps/frontend/package.json
"deploy": "vite build && gh-pages -d dist"

# Deploy
cd apps/frontend
pnpm deploy
```

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to `apps/frontend/public/`:
   ```
   yourdomain.com
   ```

2. Configure DNS with your domain provider:
   - Add a CNAME record pointing to `username.github.io`

3. In GitHub Settings → Pages, add your custom domain

## Backend Deployment

The backend can be deployed to various platforms. The workflow builds a Docker image that can be deployed anywhere.

### Option 1: Railway

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL:**
   ```bash
   railway add --database postgres
   ```

4. **Deploy:**
   ```bash
   cd apps/backend
   railway up
   ```

5. **Set environment variables in Railway dashboard:**
   - `DATABASE_URL` (automatically set by Railway)
   - `PORT` (automatically set by Railway)
   - `NODE_ENV=production`

### Option 2: Render

1. **Create account at [render.com](https://render.com)**

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Root Directory: `apps/backend`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `node dist/index.js`

3. **Add PostgreSQL database:**
   - Create a new PostgreSQL database in Render
   - Copy the Internal Database URL

4. **Set environment variables:**
   - `DATABASE_URL`: Your PostgreSQL URL
   - `PORT`: 10000 (or leave blank)
   - `NODE_ENV`: production

### Option 3: AWS ECS (with Docker)

1. **Build and push Docker image:**
   ```bash
   docker build -t fullstack-demo-backend -f apps/backend/Dockerfile .
   docker tag fullstack-demo-backend:latest YOUR_ECR_REPO_URL:latest
   docker push YOUR_ECR_REPO_URL:latest
   ```

2. **Create ECS Task Definition:**
   - Use the pushed image
   - Set environment variables
   - Configure port mappings

3. **Create ECS Service:**
   - Use the task definition
   - Configure load balancer
   - Set desired task count

### Option 4: Google Cloud Run

1. **Build and push to Google Container Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/backend apps/backend
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy backend \
     --image gcr.io/PROJECT_ID/backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Set environment variables:**
   ```bash
   gcloud run services update backend \
     --set-env-vars DATABASE_URL="your-db-url",NODE_ENV="production"
   ```

## Database Deployment

### Option 1: Supabase (Recommended)

1. **Create account at [supabase.com](https://supabase.com)**
2. **Create a new project**
3. **Get connection string:**
   - Go to Project Settings → Database
   - Copy the connection string (pooler mode)
4. **Run migrations:**
   ```bash
   cd apps/backend
   DATABASE_URL="your-supabase-url" pnpm db:push
   DATABASE_URL="your-supabase-url" pnpm db:seed
   ```

### Option 2: Neon

1. **Create account at [neon.tech](https://neon.tech)**
2. **Create a new project**
3. **Copy connection string**
4. **Run migrations** (same as Supabase)

### Option 3: Railway PostgreSQL

1. **Add database in Railway:**
   ```bash
   railway add --database postgres
   ```
2. **Connection string is automatically available**

### Option 4: AWS RDS

1. **Create RDS PostgreSQL instance**
2. **Configure security groups**
3. **Get connection string**
4. **Run migrations**

## Environment Variables

### Frontend (Production)

Required environment variables for GitHub Pages:

```env
VITE_API_URL=https://your-backend-api.com
VITE_BASE_PATH=/your-repo-name  # Only if not at root
```

### Backend (Production)

Required environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000  # Or as required by platform
NODE_ENV=production
```

## CI/CD Pipeline

### Frontend Pipeline (`.github/workflows/deploy-frontend.yml`)

Automatically deploys to GitHub Pages on push to `main`:
1. Runs linting
2. Runs tests
3. Builds the frontend
4. Deploys to GitHub Pages

### Backend Pipeline (`.github/workflows/deploy-backend.yml`)

Builds and pushes Docker image on push to `main`:
1. Runs linting
2. Runs tests
3. Builds Docker image
4. Pushes to Docker Hub

You can extend this to automatically deploy to your chosen platform.

## Post-Deployment

### 1. Update CORS Settings

If your frontend and backend are on different domains, ensure CORS is properly configured in `apps/backend/src/index.ts`.

### 2. Run Database Migrations

```bash
# Using the deployed backend
DATABASE_URL="your-production-db-url" pnpm db:push
DATABASE_URL="your-production-db-url" pnpm db:seed
```

### 3. Monitor Your Application

- Check logs for errors
- Monitor API response times
- Set up error tracking (e.g., Sentry)
- Set up uptime monitoring

### 4. Set Up SSL/HTTPS

Most platforms (GitHub Pages, Railway, Render, etc.) provide SSL automatically. For custom setups:
- Use Let's Encrypt
- Configure reverse proxy (nginx)
- Update API URLs to use HTTPS

## Troubleshooting Deployment

### GitHub Pages 404 Errors

Add a `404.html` that redirects to `index.html` for client-side routing:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/'">
  </head>
</html>
```

### API Connection Issues

1. Check CORS settings in backend
2. Verify `VITE_API_URL` is correct
3. Ensure backend is accessible from frontend domain
4. Check browser console for errors

### Database Connection Issues

1. Verify `DATABASE_URL` format
2. Check firewall/security group settings
3. Ensure database accepts connections from backend IP
4. Test connection locally first

## Rollback

### Frontend (GitHub Pages)

1. Go to Actions tab
2. Find the previous successful deployment
3. Click "Re-run all jobs"

Or manually:
```bash
git revert HEAD
git push origin main
```

### Backend (Docker)

```bash
# Pull and deploy previous version
docker pull YOUR_REPO:previous-sha
# Update your service to use the previous image
```

## Monitoring and Logs

### GitHub Pages
- Check Actions tab for deployment status
- Use browser DevTools for frontend errors

### Backend
- Railway: View logs in dashboard
- Render: View logs in dashboard
- Cloud Run: Use Cloud Logging
- AWS ECS: Use CloudWatch Logs

## Cost Estimates

- **GitHub Pages**: Free for public repos
- **Supabase**: Free tier available (500MB, 2 projects)
- **Railway**: Free tier $5/month credit
- **Render**: Free tier available (with limitations)
- **Neon**: Free tier available (1 project)

## Security Checklist

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS
- [ ] Use secure database passwords
- [ ] Enable rate limiting
- [ ] Set up authentication if needed
- [ ] Keep dependencies updated
- [ ] Use secrets management (GitHub Secrets, etc.)
