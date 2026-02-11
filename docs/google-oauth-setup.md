# Google OAuth Setup Guide

## Problem
The error "Unable to exchange external code" occurs when:
1. OAuth callback route is missing (✅ FIXED)
2. Redirect URIs are misconfigured in Google Cloud Console
3. Client credentials are incorrect in Supabase

## Solution Steps

### 1. Supabase Dashboard Configuration

1. Go to your Supabase project → **Authentication** → **Providers**
2. Enable **Google** provider
3. Copy the **Callback URL** shown (should be like `https://[your-project].supabase.co/auth/v1/callback`)
4. Enter your **Google Client ID** and **Client Secret**
5. Save the configuration

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `GharGo Auth` (or any name)
   
5. **Authorized redirect URIs** - Add BOTH:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
   
6. Click **CREATE**
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase (Step 1.4 above)

### 3. OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal if G Workspace)
3. Fill in:
   - App name: `GharGo`
   - User support email: your email
   - Developer contact: your email
4. Add scopes (optional): `email`, `profile`
5. Add test users if in testing mode
6. Save and continue

### 4. Test the Integration

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:3000/en/auth/login`
3. Click "Sign in with Google"
4. Should redirect successfully now!

## Important Notes

- The callback route is now at `/auth/callback` (outside the `[lang]` folder to avoid i18n complications)
- For production, update the redirect URI to your production domain
- Keep your Client Secret secure (never commit to Git)
