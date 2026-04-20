# EM Feed — Deployment Guide

## Prerequisites

- Node.js 18+ installed
- GitHub account
- Supabase account (free tier)
- Anthropic account with API key
- Vercel account (free tier)

## Step 1: Set up Supabase

1. Go to https://supabase.com and create a new project.
2. Once the project is ready, go to the **SQL Editor** in the left sidebar.
3. Copy the contents of `supabase-schema.sql` and paste it into the SQL Editor.
4. Click **Run** to execute the schema. This creates all tables and seeds the predefined tags.
5. Go to **Project Settings → API**.
6. Copy your **Project URL** and **anon/public key** — you will need these in Step 4.

## Step 2: Get your Anthropic API key

1. Go to https://console.anthropic.com and log in.
2. Navigate to **API Keys** and create a new key.
3. Copy the key — you will only see it once.

## Step 3: Clone and configure locally

```bash
git clone <your-repo-url>
cd em-feed
npm install
```

Create a `.env.local` file (copy from `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=pick_any_random_string_here
```

Test locally:

```bash
npm run dev
```

Visit http://localhost:3000. Click **Refresh Feed** to fetch your first articles.

## Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/em-feed.git
git push -u origin main
```

## Step 5: Deploy to Vercel

1. Go to https://vercel.com and click **Add New Project**.
2. Import your GitHub repository.
3. Vercel will detect Next.js automatically — leave settings as default.
4. Before deploying, add environment variables in the **Environment Variables** section:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `CRON_SECRET`
5. Click **Deploy**.

## Step 6: Configure Vercel cron

The `vercel.json` file already configures a daily cron at 6am UTC that calls `/api/refresh`. Vercel cron jobs automatically include the `Authorization: Bearer <CRON_SECRET>` header.

To verify the cron is registered:
1. Go to your Vercel project dashboard.
2. Navigate to **Settings → Cron Jobs**.
3. You should see the `/api/refresh` job listed.

## Step 7: Verify everything works

1. Visit your deployed URL.
2. Click **Refresh Feed** in the navbar.
3. Wait 10-30 seconds — articles should start appearing.
4. Click on any article to expand it.
5. Click **Generate AI Summary** to test the Anthropic integration.
6. Visit `/sources` to confirm all default sources loaded.

## Troubleshooting

**No articles loading:** Check Vercel function logs at Vercel Dashboard → Deployments → Functions. The refresh endpoint logs errors per source.

**Supabase connection errors:** Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct and have no trailing spaces.

**AI summaries failing:** Verify `ANTHROPIC_API_KEY` is set correctly in Vercel environment variables. Redeploy after adding env vars.

**CORS or fetch errors in browser:** This is a Next.js app, all API calls are same-origin. If you see these, double-check Supabase row-level security (RLS) settings — for a single-user app, you may need to disable RLS or add an allow-all policy.
