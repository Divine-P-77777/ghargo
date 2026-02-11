# Google OAuth - Quick Setup Checklist ✅

## What I Fixed
- ✅ Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`
- ✅ Updated OAuth action to use environment variable (matches documentation)
- ✅ Simplified callback handler at `/app/auth/callback/route.ts`

## What YOU Need to Do

### 1. Google Cloud Console
Go to [console.cloud.google.com](https://console.cloud.google.com)

**Add these Authorized Redirect URIs:**
```
http://localhost:3000/auth/callback
https://ikicdsmygnzplltfguel.supabase.co/auth/v1/callback
```

**Add Authorized JavaScript Origin:**
```
http://localhost:3000
```

### 2. Supabase Dashboard
Go to: Authentication → Providers → Google

1. Enable Google provider
2. Paste your **Google Client ID**
3. Paste your **Google Client Secret**
4. Save

### 3. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 4. Test
1. Visit: `http://localhost:3000/en/auth/login`
2. Click "Sign in with Google"
3. Should work now! ✨

## Common Issues

❌ **"redirect_uri_mismatch"** → Check Google Cloud Console URIs match exactly
❌ **"Unable to exchange code"** → Verify Client ID and Secret are correct in Supabase
❌ **Still not working?** → Check browser console for detailed errors

## Production Deployment

When deploying, update:
1. `.env.local` → `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
2. Google Cloud Console → Add `https://yourdomain.com/auth/callback`
