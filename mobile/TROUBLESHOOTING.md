# Troubleshooting Guide

## Known Issues

### 1. Interview Prep API Error - "JSON Parse error: Unexpected character: I"

**Error Message:**
```
Error fetching interview preps: [SyntaxError: JSON Parse error: Unexpected character: I]
ERROR Failed to load interview preps: JSON Parse error: Unexpected character: I
```

**Cause:**
The backend endpoint `/api/interview-prep/list` is returning HTML instead of JSON. This typically happens when:
1. The endpoint doesn't exist on the backend (404 error returns HTML)
2. The backend is experiencing an internal server error (500 error returns HTML)
3. The backend route is misconfigured

**Status:** ✅ **FIXED** (error handling improved)

**Fix Applied:**
Updated `src/api/interviewApi.ts` to:
- Check `Content-Type` header before parsing JSON
- Handle non-JSON responses gracefully
- Extract meaningful error messages from HTML responses
- Return user-friendly error messages

**What the fix does:**
- Prevents JSON parse crash
- Shows meaningful error: "Backend error (500): The interview prep endpoint may not be available"
- Logs full response for debugging

**Backend Investigation Needed:**

The backend endpoint may be missing or broken. To verify:

1. **Check if endpoint exists:**
   ```bash
   curl https://resume-ai-backend-production-3134.up.railway.app/api/interview-prep/list
   ```

2. **Check backend logs:**
   - Go to Railway dashboard
   - View deployment logs
   - Look for errors related to `/api/interview-prep/list`

3. **Possible backend fixes:**
   - Endpoint doesn't exist → Add route handler
   - Endpoint crashes → Fix server-side error
   - Database query fails → Fix SQL/ORM query
   - Authentication issue → Check JWT validation

**Workaround for Users:**

The mobile app will gracefully show:
- Empty state on Interview Prep screen
- Error message: "Backend error - The interview prep endpoint may not be available"
- User can still access other features

**Web App Comparison:**

The web app uses the same endpoint (`/api/interview-prep/list`). If the web app works but mobile doesn't:
- Check authentication headers (web uses Clerk, mobile uses Supabase)
- Verify CORS settings on backend
- Compare request headers between web and mobile

---

## General Troubleshooting

### API Connection Issues

**Symptom:** "Failed to fetch" or network errors

**Check:**
1. Device has internet connection
2. API_BASE_URL is correct: `https://resume-ai-backend-production-3134.up.railway.app`
3. Backend is running (check Railway dashboard)
4. No VPN/firewall blocking Railway domain

### Authentication Issues

**Symptom:** 401 Unauthorized errors

**Check:**
1. User is signed in (check Supabase session)
2. JWT token is valid (not expired)
3. Backend expects correct auth header format
4. User ID exists in database

### Supabase Connection Issues

**Symptom:** Can't sign in or "Session error"

**Check:**
1. `EXPO_PUBLIC_SUPABASE_URL` is correct
2. `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Supabase project is active (not paused)
4. Database tables exist (users, profiles)

---

## Debug Mode

Enable detailed API logging:

1. Open `src/api/base.ts`
2. Uncomment debug logs (search for `console.log`)
3. Rebuild app: `npx expo start --clear`
4. Check metro bundler console for API request details

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request payload format |
| 401 | Unauthorized | Sign in again |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Server Error | Backend issue - check logs |
| 502 | Bad Gateway | Railway deployment issue |
| 503 | Service Unavailable | Backend is down |

---

## Reporting Issues

When reporting bugs, include:
1. Error message (full text)
2. Screen where error occurred
3. Steps to reproduce
4. Platform (iOS/Android)
5. App version
6. Console logs (metro bundler)

---

## Backend Health Check

Test backend is responding:

```bash
# Check if backend is alive
curl https://resume-ai-backend-production-3134.up.railway.app/health

# Expected response:
{"status": "ok", "version": "1.0.0"}
```

If health check fails:
- Backend is down
- Check Railway deployment status
- Check Railway logs for crash/errors

---

## Contact

For issues not covered here, create a GitHub issue with:
- Full error message
- Screenshots
- Steps to reproduce
- Console logs

---

**Last Updated:** February 21, 2026
