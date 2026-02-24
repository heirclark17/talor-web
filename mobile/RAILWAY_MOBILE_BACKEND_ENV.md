# Railway Environment Variables for Mobile Backend

Add these to your NEW Railway mobile backend project:

## Required Variables

### Database (Use existing PostgreSQL)
```
DATABASE_URL=postgresql://postgres:SUCByvKQvPeSxnLxystaiyRvEMpRvDUn@switchyard.proxy.rlwy.net:54571/railway
```
**Note:** This connects to your existing database so mobile and web share the same users.

### Supabase Authentication
```
SUPABASE_URL=https://yokyxytijxmkdbrezzzb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3l4eXRpanhta2RicmV6enpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDc1MzEsImV4cCI6MjA4NzEyMzUzMX0.hw86oSvNHFkYu39Fpx3vqUko9tAWOs074ljDmk2qIJg
```

### API Keys (Optional - if you have them)
```
OPENAI_API_KEY=your_openai_key_here
CLAUDE_API_KEY=your_claude_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here
FIRECRAWL_API_KEY=your_firecrawl_key_here
```

### AWS S3 (Optional - if you use S3 for storage)
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_S3_REGION=us-east-1
```

### CORS Settings
```
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.*:8081
```
**Note:** Add your local Expo dev server URLs here.

## How to Add Variables

1. Go to your new Railway mobile backend project
2. Click **"Variables"** tab
3. Click **"New Variable"** for each one above
4. Copy/paste the name and value
5. Railway will auto-redeploy after adding variables

## After All Variables Added

Railway will redeploy with:
- PostgreSQL database connected ✅
- Supabase auth configured ✅
- All tables will auto-create on first request ✅

Your new backend URL will be something like:
`https://resume-ai-mobile-backend-production-XXXX.up.railway.app`

Copy that URL - you'll need it for the mobile app .env file.
