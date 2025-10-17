# Vercel Deployment Guide

## Quick Setup

### 1. Install Vercel CLI (Optional - for local testing)
```bash
npm install -g vercel
```

### 2. Configure Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add these environment variables:

**Production & Preview Environment:**
- `GOOGLE_AI_API_KEY` = Your Google AI API key
- `SUPABASE_URL` = `https://mtpirrtjzhbddwpwgazq.supabase.co`
- `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cGlycnRqemhiZGR3cHdnYXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNTQ3NDYsImV4cCI6MjA2ODYzMDc0Nn0.GSlkjyYbF5aiNGSTFIKIvcBgow5kRviWUF8KILSmK-U`
- `CORS_ALLOW_ORIGINS` = `https://yourdomain.com,http://localhost:8080`
- `DAILY_QUERY_CAP` = `10`

### 3. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Connect your GitHub repository
2. Vercel will auto-detect the configuration
3. Click "Deploy"

#### Option B: Deploy via CLI
```bash
vercel --prod
```

## Local Development

### Running with Vite (Recommended for frontend development)
```bash
npm run dev
```
This runs on `http://localhost:8080`

### Running with Vercel Dev (For testing API routes)
```bash
vercel dev
```

## API Endpoint

Your API will be available at:
- Local: `http://localhost:8080/api/rag-query`
- Production: `https://yourdomain.vercel.app/api/rag-query`

## Testing the API

```bash
curl -X POST https://yourdomain.vercel.app/api/rag-query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
  -d '{"query": "What is your experience with React?", "stream": false}'
```

## Troubleshooting

### Build Errors
If you get TypeScript errors during build:
1. The build uses `skipLibCheck: true` to bypass project reference issues
2. Make sure all environment variables are set in Vercel dashboard

### API Not Working
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure CORS origins include your domain

### Local Development
- Use `npm run dev` for frontend development (faster)
- Use `vercel dev` only when testing API routes locally
- Create a `.env.local` file based on `.env.local.example` for local API testing
