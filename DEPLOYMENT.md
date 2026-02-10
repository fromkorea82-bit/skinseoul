# Deployment Guide - SkinSEOUL

## Prerequisites

1. **Supabase Project**
   - Create account at https://supabase.com
   - Create new project
   - Run database migrations from `/docs/DATABASE_SCHEMA.md`
   - Run seed scripts: `npm run seed`

2. **OpenAI API Key**
   - Create account at https://platform.openai.com
   - Generate API key
   - Ensure you have credits

3. **Vercel Account**
   - Sign up at https://vercel.com
   - Connect GitHub repository

## Step-by-Step Deployment

### 1. Supabase Setup

```bash
# 1. Go to Supabase Dashboard
# 2. Create new project
# 3. Wait for project to be ready (~2 minutes)
# 4. Go to SQL Editor
# 5. Copy and run init-db.sql from scripts/
# 6. Verify tables created in Table Editor
```

### 2. Environment Variables

Get these values:

**From Supabase:**
- Project Settings > API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**From OpenAI:**
- Platform > API Keys
- Create new key → `OPENAI_API_KEY`

### 3. Seed Database

```bash
# Set environment variables in .env.local
npm run seed
```

### 4. Deploy to Vercel

**Option A: Git Integration (Recommended)**

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click "Deploy"

**Option B: Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 5. Post-Deployment

1. **Test the deployment:**
   - Visit your-project.vercel.app
   - Test photo analysis
   - Check product recommendations

2. **Configure custom domain (optional):**
   - Vercel Dashboard > Domains
   - Add custom domain
   - Update DNS records

3. **Monitor:**
   - Vercel Dashboard > Analytics
   - Check for errors in Logs

## Troubleshooting

**Build fails:**
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies installed

**API errors in production:**
- Verify environment variables in Vercel
- Check Supabase RLS policies
- Ensure OpenAI API key has credits

**Images not loading:**
- Check `next.config.mjs` image domains
- Verify Supabase storage permissions

## Performance Optimization

- Enable Vercel Analytics
- Monitor Core Web Vitals
- Optimize images with next/image
- Enable caching headers

## Security Checklist

- [ ] API keys in environment variables (never in code)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting implemented
- [ ] Supabase RLS policies enabled
- [ ] No sensitive data in client-side code

## Costs Estimate (Month 1)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Vercel Pro | - | $20/month |
| Supabase | 500MB DB | $0 (free tier) |
| OpenAI API | - | ~$13 (1,000 analyses) |
| **Total** | | **~$33/month** |

## Scaling Considerations

**At 10,000 users/month:**
- Upgrade Supabase to Pro ($25/month)
- OpenAI costs: ~$130/month
- Vercel Pro sufficient
- Total: ~$175/month
