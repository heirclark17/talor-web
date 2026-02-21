# Supabase Email Verification Debugging Guide

## Issue: Email verification not sending

### Quick Diagnosis Checklist

Run through this checklist to identify the issue:

- [ ] **1. Check Supabase Dashboard Settings**
  - Go to: Authentication → Settings
  - Verify: "Enable email confirmations" is CHECKED
  - Verify: "Confirm email" is set to "required"

- [ ] **2. Check SMTP Configuration** (MOST COMMON ISSUE)
  - Go to: Project Settings → Auth → SMTP Settings
  - For Production: MUST configure custom SMTP
  - For Development: Can use Supabase's free service (limited)

- [ ] **3. Check Redirect URLs**
  - Go to: Authentication → URL Configuration
  - Add: `talor://auth/callback`
  - Add: `talor://*`
  - Add: `https://talorme.com/auth/confirm` (web fallback)

- [ ] **4. Check Email Templates**
  - Go to: Authentication → Email Templates → Confirm signup
  - Verify template exists and contains `{{ .ConfirmationURL }}`

- [ ] **5. Test Rate Limits**
  - Supabase free tier: 3 emails per hour
  - Wait 20 minutes and try again

- [ ] **6. Check Spam Folder**
  - Verification emails sometimes go to spam
  - Add `noreply@mail.app.supabase.io` to contacts

---

## SMTP Setup Instructions

### Option 1: SendGrid (Recommended - Free Tier: 100 emails/day)

1. Sign up at https://sendgrid.com
2. Create API key with "Mail Send" permission
3. In Supabase Dashboard:
   ```
   Settings → Auth → SMTP Settings:

   Enable Custom SMTP: ✓
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Admin Email: noreply@yourdomain.com
   SMTP Sender Name: Talor
   SMTP Username: apikey
   SMTP Password: <your-sendgrid-api-key>
   ```

### Option 2: Resend (Recommended - Free Tier: 3000 emails/month)

1. Sign up at https://resend.com
2. Add and verify your domain
3. Create API key
4. In Supabase Dashboard:
   ```
   Settings → Auth → SMTP Settings:

   Enable Custom SMTP: ✓
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP Admin Email: noreply@yourdomain.com
   SMTP Sender Name: Talor
   SMTP Username: resend
   SMTP Password: <your-resend-api-key>
   ```

### Option 3: AWS SES (Production - Very Cheap)

1. Set up AWS SES and verify domain
2. Create SMTP credentials
3. In Supabase Dashboard:
   ```
   Settings → Auth → SMTP Settings:

   Enable Custom SMTP: ✓
   SMTP Host: email-smtp.<region>.amazonaws.com
   SMTP Port: 587
   SMTP Admin Email: noreply@yourdomain.com
   SMTP Sender Name: Talor
   SMTP Username: <aws-smtp-username>
   SMTP Password: <aws-smtp-password>
   ```

---

## Debugging Console Logs

When you sign up, check the console for these logs:

### ✅ Expected Logs (Email Verification Enabled):
```
[SupabaseAuth] Starting sign up for: user@example.com
[SupabaseAuth] Sign up successful!
[SupabaseAuth] User created: user@example.com
[SupabaseAuth] User ID: <uuid>
[SupabaseAuth] Email confirmed: NOT CONFIRMED
[SupabaseAuth] Confirmation required: true
[SupabaseAuth] ✉️ Verification email should be sent to: user@example.com
```

### ⚠️ Wrong Logs (Email Verification Disabled):
```
[SupabaseAuth] Sign up successful!
[SupabaseAuth] Email confirmed: <timestamp>  ← This means auto-confirmed!
[SupabaseAuth] ⚠️ User auto-confirmed - email verification is DISABLED in Supabase dashboard
```

### ❌ Error Logs (Check These):
```
[SupabaseAuth] Sign up error: <error message>
[SupabaseAuth] Error details: { ... }
```

Common error messages:
- `"Email rate limit exceeded"` → Wait 20 minutes, try again
- `"Invalid email"` → Email format issue
- `"User already registered"` → Email already exists
- `"SMTP configuration error"` → SMTP not set up correctly

---

## Testing Steps

### 1. Test Direct in Supabase Dashboard

1. Go to: Authentication → Users
2. Click "Add user" → "Send email invitation"
3. Enter test email
4. Check if email arrives

**Result:**
- ✅ Email received → SMTP works, issue is in app code
- ❌ No email → SMTP not configured correctly

### 2. Test Sign-Up with Logging

1. Clear app data: Settings → Apps → Talor → Clear Data
2. Launch app and sign up with NEW email
3. Watch console logs
4. Check email inbox (and spam folder!)

### 3. Test Resend Verification

```typescript
// In your sign-up screen after sign up:
await resendVerification(email);
```

---

## Quick Fixes

### Fix 1: Disable Email Confirmation (DEV ONLY!)

**Supabase Dashboard:**
```
Authentication → Settings
☐ Uncheck "Enable email confirmations"
```

⚠️ **WARNING:** Users can sign up without verifying email. Use only for development!

### Fix 2: Use Magic Link Authentication

Instead of password-based auth, use magic links (passwordless):

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: 'talor://auth/callback',
  }
});
```

This sends a login link instead of requiring password + verification.

### Fix 3: Check Supabase Project Status

- Go to: https://status.supabase.com
- Check if email service is down
- Check your project's region status

---

## Environment Variables Check

Verify your `.env` file has correct values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://yokyxytijxmkdbrezzzb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Test connection:
```bash
curl https://yokyxytijxmkdbrezzzb.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

---

## Still Not Working?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth logs
   - Look for email sending attempts

2. **Check Email Provider Logs:**
   - SendGrid: Activity → Email Activity
   - Resend: Logs → Email Logs
   - Check for bounces, blocks, or delivery failures

3. **Contact Supabase Support:**
   - Go to: https://supabase.com/dashboard/support
   - Attach error logs and describe issue

4. **Use Alternative Auth:**
   - Phone/SMS authentication
   - Social auth (Google, Apple, etc.)
   - Magic link (passwordless)

---

## Current Code Changes

The following improvements were added:

1. **Better error logging** - See exactly what's failing
2. **Auto-confirm detection** - Warns if email verification is disabled
3. **Web fallback URL** - Provides alternative confirmation path
4. **Detailed console logs** - Debug what's happening

Check console when signing up to see detailed diagnostics!
