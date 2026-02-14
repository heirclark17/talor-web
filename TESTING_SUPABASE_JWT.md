# Testing Supabase JWT Authentication

## Quick Start

After completing the setup steps in `SUPABASE_SETUP_GUIDE.md`, test the integration using these methods.

---

## ✅ Test 1: Mobile App End-to-End Test

**Goal:** Verify mobile app can authenticate and make API calls

### Steps:

1. **Sign in via mobile app**
   - Open your Expo app
   - Sign in with Supabase credentials
   - Should see main app screen

2. **Make an API call**
   - Upload a resume, or
   - List existing resumes, or
   - Navigate to any screen that loads data

3. **Check backend logs**
   - Look for: `[Auth] Created new user from Supabase JWT: your@email.com`
   - This confirms JWT was validated and user was created

### Expected Behavior:
- ✅ Sign in succeeds
- ✅ App shows user data
- ✅ No authentication errors in console
- ✅ Backend creates user record with `supabase_id`

---

## ✅ Test 2: Test Endpoints (Manual Testing)

**Goal:** Verify JWT validation works independently

### Get Your JWT Token First

**Option A: From Mobile App**
1. Open Chrome DevTools (inspect mobile app web view if using web)
2. Go to Network tab
3. Make an API call from the app
4. Find any request to your backend
5. Copy the `Authorization: Bearer <token>` header value

**Option B: From Supabase Auth**
```javascript
// In mobile app, add temporary logging
const token = await getAuthToken();
console.log('JWT Token:', token);
```

### Test JWT Endpoint

```bash
curl -X GET http://localhost:8000/api/auth/test/jwt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "JWT authentication successful!",
  "user": {
    "id": 1,
    "email": "your@email.com",
    "supabase_id": "uuid-here",
    "is_active": true,
    "created_at": "2026-02-13T..."
  },
  "auth_method": "supabase_jwt"
}
```

### Test Unified Auth Endpoint

```bash
curl -X GET http://localhost:8000/api/auth/test/unified \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authenticated via user account",
  "user": {
    "id": 1,
    "email": "your@email.com",
    "supabase_id": "uuid-here",
    "username": null,
    "is_active": true
  },
  "session_id": "supabase_uuid-here",
  "auth_method": "jwt"
}
```

### Test WhoAmI Endpoint

```bash
curl -X GET http://localhost:8000/api/auth/test/whoami \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "authenticated": true,
  "email": "your@email.com",
  "user_id": "supabase_uuid-here",
  "method": "jwt"
}
```

---

## ✅ Test 3: Production API Calls

**Goal:** Verify real endpoints work with JWT

### List Resumes

Currently uses `X-User-ID` header. To migrate to JWT, endpoints need updating.

**Current (session-based):**
```bash
curl -X GET http://localhost:8000/api/resumes/list \
  -H "X-User-ID: user_123"
```

**Future (JWT-based):**
```bash
curl -X GET http://localhost:8000/api/resumes/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Migrating Endpoints to Use JWT

### Current Pattern (Session-based)
```python
@router.get("/list")
async def list_resumes(
    user_id: str = Depends(get_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Uses X-User-ID header
    query = select(BaseResume).where(BaseResume.session_user_id == user_id)
    # ...
```

### New Pattern (Unified Auth)
```python
@router.get("/list")
async def list_resumes(
    auth_result: tuple = Depends(get_current_user_unified),
    db: AsyncSession = Depends(get_db)
):
    user, user_id = auth_result

    # user_id works for both JWT and session-based auth
    query = select(BaseResume).where(BaseResume.session_user_id == user_id)
    # ...

    # Optional: Access user object if authenticated via JWT
    if user:
        # Can access user.email, user.supabase_id, etc.
        print(f"Authenticated user: {user.email}")
```

### Migration Strategy

**Option 1: Non-Breaking (Recommended)**
- Keep existing endpoints working with `X-User-ID`
- Add new JWT-enabled endpoints
- Gradually migrate mobile app to use new endpoints

**Option 2: Full Migration**
- Update all endpoints to use `get_current_user_unified`
- Mobile app still works (sends `X-User-ID` as fallback)
- JWT authentication works immediately

---

## 🐛 Troubleshooting

### Error: "Authorization header required"

**Cause:** No `Authorization` header sent

**Fix:** Mobile app should automatically send this. Check:
```typescript
// In mobile/src/api/base.ts
const token = await getAuthToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Error: "Invalid token"

**Possible causes:**
1. JWT secret mismatch
2. Token expired
3. Token from wrong Supabase project

**Debug steps:**
1. Verify `SUPABASE_JWT_SECRET` matches your Supabase dashboard
2. Check token expiration (tokens expire after 1 hour)
3. Sign out and sign in again to get fresh token

### Error: "Server misconfiguration: JWT secret not set"

**Cause:** Backend `.env` missing `SUPABASE_JWT_SECRET`

**Fix:**
1. Get JWT secret from Supabase dashboard
2. Update `backend/.env`
3. Restart backend

### User Created but API Returns 401

**Cause:** Token might have expired between creation and API call

**Fix:**
1. Sign out and sign in again
2. Check mobile app refreshes tokens automatically
3. Verify Supabase session is still active

---

## 📊 Verification Checklist

After testing, verify:

- [ ] Mobile app sign in works
- [ ] JWT token saved to SecureStore
- [ ] API calls include `Authorization: Bearer {token}` header
- [ ] Backend validates JWT successfully
- [ ] User created in database with `supabase_id`
- [ ] Test endpoints return correct user data
- [ ] Existing session-based auth still works (backward compatibility)

---

## 🎯 Success Criteria

✅ **Authentication Working** if:
1. Mobile app can sign in with Supabase
2. JWT token sent in all API requests
3. Backend logs show: "Created new user from Supabase JWT"
4. Database has user record with `supabase_id`
5. Test endpoints return user info
6. No 401/403 errors in mobile app

✅ **Ready for Production** if:
1. All success criteria above met
2. Existing session-based users still work
3. No breaking changes to current functionality
4. Migration plan documented for future endpoint updates

---

## 📝 Next Steps After Testing

### Immediate
- [ ] Test mobile app authentication
- [ ] Verify JWT validation with test endpoints
- [ ] Check database for user creation
- [ ] Monitor backend logs for errors

### Short-term
- [ ] Migrate key endpoints to use unified auth
- [ ] Add user profile screen
- [ ] Implement password reset flow
- [ ] Add email verification UI

### Long-term
- [ ] Migrate all session data to user accounts
- [ ] Remove legacy session-based auth
- [ ] Add social authentication (Google, GitHub)
- [ ] Implement multi-device session management

---

## 🔗 Related Files

- **Setup Guide:** `SUPABASE_SETUP_GUIDE.md`
- **Mobile Auth Context:** `mobile/src/contexts/SupabaseAuthContext.tsx`
- **Backend Auth Middleware:** `backend/app/middleware/auth.py`
- **Test Endpoints:** `backend/app/routes/auth_test.py`
- **User Model:** `backend/app/models/user.py`
- **Migration Script:** `backend/add_supabase_id.py`
