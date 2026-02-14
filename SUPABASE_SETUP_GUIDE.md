# Supabase Authentication Setup Guide

## ✅ What's Already Done

### Mobile App (Complete)
- ✅ Supabase client configured in `mobile/src/lib/supabase.ts`
- ✅ Auth context created in `mobile/src/contexts/SupabaseAuthContext.tsx`
- ✅ Sign up screen updated (`mobile/src/screens/SignUpScreen.tsx`)
- ✅ Sign in screen updated (`mobile/src/screens/SignInScreen.tsx`)
- ✅ JWT tokens automatically saved to SecureStore
- ✅ JWT tokens sent via `Authorization: Bearer {token}` header in all API calls
- ✅ App navigation updated to use Supabase auth state

### Backend Infrastructure (Complete)
- ✅ User model updated with `supabase_id` field
- ✅ Migration script created (`backend/add_supabase_id.py`)
- ✅ JWT validation middleware created (`backend/app/middleware/auth.py`)
- ✅ Unified authentication supporting JWT, API key, and session ID
- ✅ Auto-create user on first JWT sign-in

---

## 🔧 Setup Steps (5 minutes)

### Step 1: Get JWT Secret from Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard/project/jovqlajgulnbcihyyolh
2. Click **Settings** (gear icon) in the left sidebar
3. Click **API** under "Project Settings"
4. Scroll to **JWT Settings** section
5. Copy the **JWT Secret** value (starts with a long string of letters/numbers)

### Step 2: Update Backend Environment File

Open `C:\Users\derri\projects\resume-ai-app\backend\.env` and replace this line:

```env
SUPABASE_JWT_SECRET=your_jwt_secret_here_from_supabase_dashboard
```

With your actual JWT secret:

```env
SUPABASE_JWT_SECRET=your_actual_secret_here
```

### Step 3: Run Database Migration

Open a terminal and run:

```bash
cd /c/Users/derri/projects/resume-ai-app/backend
python add_supabase_id.py
```

Expected output:
```
[Migration] Adding supabase_id column to users table...
[Migration] ✓ Added supabase_id column
[Migration] ✓ Made username nullable
[Migration] ✓ Made api_key nullable
[Migration] ✓ Created index on supabase_id
[Migration] Migration complete!
```

### Step 4: Restart Backend Server

If your backend is running on Railway, it will auto-deploy when you push the changes.

If running locally:
```bash
cd /c/Users/derri/projects/resume-ai-app/backend
python -m uvicorn app.main:app --reload
```

---

## 🧪 Testing the Integration

### Test 1: Sign In via Mobile App

1. Open the mobile app
2. Sign in with your Supabase account
3. Navigate to a screen that makes API calls (e.g., resume upload)
4. Check backend logs for: `[Auth] Created new user from Supabase JWT: your@email.com`

### Test 2: Verify Database User Created

After signing in, check your database for the new user record:

```sql
SELECT id, email, supabase_id, username, is_active, created_at
FROM users
WHERE supabase_id IS NOT NULL;
```

You should see a row with your email and Supabase user ID.

### Test 3: Test API Call with JWT

The mobile app automatically sends JWT tokens. To test manually:

1. Get your JWT token from Supabase (inspect network requests in mobile app)
2. Make a test API call:

```bash
curl -X GET https://your-backend.railway.app/api/resumes/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🔄 Authentication Flow

### How It Works Now

```
┌─────────────┐
│ Mobile App  │
└──────┬──────┘
       │
       │ 1. User signs in
       ▼
┌─────────────────┐
│ Supabase Auth   │
│ Returns JWT     │
└──────┬──────────┘
       │
       │ 2. JWT saved to SecureStore
       ▼
┌─────────────────┐
│ API calls with  │
│ Authorization:  │
│ Bearer {token}  │
└──────┬──────────┘
       │
       │ 3. Backend validates JWT
       ▼
┌─────────────────────┐
│ Railway Backend     │
│ - Decodes JWT       │
│ - Verifies signature│
│ - Finds/creates user│
│ - Returns data      │
└─────────────────────┘
```

### Supported Authentication Methods

The backend now supports **3 authentication methods** (in priority order):

1. **Supabase JWT** (mobile app) - `Authorization: Bearer {token}`
2. **API Key** (web app) - `X-API-Key: {key}`
3. **Session ID** (legacy) - `X-User-ID: {id}`

---

## 🚨 Troubleshooting

### Error: "JWT secret not set"

- **Cause:** `SUPABASE_JWT_SECRET` not in backend `.env` file
- **Fix:** Complete Step 2 above

### Error: "Invalid token"

- **Cause:** JWT secret doesn't match Supabase project
- **Fix:** Copy the exact JWT secret from Supabase dashboard (Step 1)

### Error: "Table users has no column supabase_id"

- **Cause:** Migration not run
- **Fix:** Complete Step 3 above

### Error: "Token expired"

- **Cause:** User session expired (JWT tokens expire after 1 hour by default)
- **Fix:** User needs to sign in again (mobile app handles this automatically)

### Migration Error: "Column already exists"

- **Solution:** Migration script checks for existing columns, it's safe to re-run

---

## 📋 Migration Checklist

- [ ] JWT secret copied from Supabase dashboard
- [ ] Backend `.env` updated with JWT secret
- [ ] Database migration run successfully
- [ ] Backend restarted (or deployed to Railway)
- [ ] Mobile app can sign in with Supabase
- [ ] API calls work from mobile app
- [ ] User record created in database with `supabase_id`

---

## 🔐 Security Notes

### JWT Token Storage
- ✅ Tokens stored in `SecureStore` (encrypted on device)
- ✅ Tokens cleared on sign out
- ✅ Tokens auto-refresh via Supabase SDK

### Backend Validation
- ✅ JWT signature verified using HS256 algorithm
- ✅ Token expiration checked (`verify_exp: True`)
- ✅ Supabase user ID extracted and validated
- ✅ User auto-created on first sign-in
- ✅ Inactive users rejected

### Database Security
- ✅ `supabase_id` column indexed for fast lookups
- ✅ `supabase_id` unique constraint prevents duplicates
- ✅ Users table supports both Supabase and API key auth

---

## 📊 Architecture Decision Record

### Why Keep Railway + Postgres?

**Decision:** Use Supabase for **authentication only**, keep Railway for **business logic and data**.

**Reasons:**
1. **Existing data** - All resumes, jobs, tailoring already in Railway Postgres
2. **No data migration** - Don't need to move 1000s of records
3. **Backend logic** - Complex AI tailoring, resume parsing stays on Railway
4. **Cost optimization** - Railway Postgres already paid for
5. **Separation of concerns** - Auth vs. application data

**How it works:**
- Supabase: User authentication, JWT issuance
- Railway: Application logic, resume data, job data, AI processing
- Bridge: JWT tokens validated by Railway backend

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 1: Basic Integration (Current)
- [x] Mobile app uses Supabase auth
- [x] JWT tokens sent to backend
- [x] Backend validates JWTs
- [x] User records created automatically

### Phase 2: Data Migration (Optional)
- [ ] Migrate session-based data to user accounts
- [ ] Link `X-User-ID` sessions to Supabase user IDs
- [ ] Consolidate user data

### Phase 3: Advanced Features (Future)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Social auth (Google, GitHub)
- [ ] Multi-device session management
- [ ] Account settings screen

---

## 📞 Support

If you encounter issues:

1. Check backend logs for JWT validation errors
2. Verify JWT secret matches Supabase dashboard
3. Ensure migration ran successfully
4. Test with a fresh sign-in (clear app data)

**Current Status:** Mobile app authenticated ✅ | Backend integration ready ✅ | Testing pending ⏳
