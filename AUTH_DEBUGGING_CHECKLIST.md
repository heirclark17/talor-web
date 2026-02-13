# Auth Flow Debugging Checklist

## Quick Diagnosis Workflow

### 1. Verification Screen UI ✓ FIXED
- [x] "Resend" link visible
- [x] "Go Back" link visible
- [x] Buttons above keyboard
- [x] ScrollView scrollable
- [x] Improved hitSlop for tapping

**Status:** Should be fixed with extra padding and spacer

---

### 2. Verification Code Submission

When user taps "Verify & Continue", check console for:

#### ✅ Expected Success Pattern:
```
[SignUp] Verify result: { status: "complete", createdSessionId: "sess_...", createdUserId: "user_..." }
[SignUp] Setting active session: sess_...
[SignUp] Session activated! Waiting for Clerk state update...
[useAuthSync] Auth state: { isSignedIn: true, userId: "user_...", sessionId: "sess_..." }
[AppNavigator] Auth state changed: { isSignedIn: true, willShow: "MAIN APP" }
```

→ User navigates to main app ✅

---

#### ❌ Failure Pattern 1: Invalid Code
```
[SignUp] Verification error: {errors: [{message: "Invalid verification code"}]}
```

**Fix:** User enters correct code or taps Resend

---

#### ❌ Failure Pattern 2: No Session Created
```
[SignUp] Verify result: { status: "complete", createdSessionId: null }
[SignUp] No session ID returned: {...}
```

**Root Cause:** Clerk configuration issue

**Fix:**
1. Check Clerk Dashboard → Settings → Email verification
2. Ensure "Require email verification" is enabled
3. Check "Session lifetime" settings
4. Try disabling "Email verification" temporarily to test

---

#### ❌ Failure Pattern 3: Session Created But State Doesn't Update ⚠️ MOST LIKELY
```
[SignUp] Verify result: { status: "complete", createdSessionId: "sess_...", createdUserId: "user_..." }
[SignUp] Setting active session: sess_...
[SignUp] Session activated! Waiting for Clerk state update...

// 100ms later...
[useAuthSync] Auth state: { isSignedIn: false, userId: null, sessionId: "sess_..." }
[AppNavigator] Auth state changed: { isSignedIn: false, willShow: "AUTH SCREEN" }
```

**Root Cause:** Clerk React context not updating after setActive()

**Possible Issues:**
- Async state propagation delay
- React context update not triggering re-render
- Stale Clerk cache
- Session has "pending tasks" blocking activation

---

## Emergency Fixes (If Scenario 3 Occurs)

### Fix A: Increase Delay ⏱️
**File:** `mobile/src/screens/SignUpScreen.tsx`

```typescript
// Line ~115: Change from 100ms to 500ms
await new Promise(resolve => setTimeout(resolve, 500));
```

**Why:** Give Clerk more time to update internal state

---

### Fix B: Force Clerk Reload 🔄
**File:** `mobile/src/screens/SignUpScreen.tsx`

Add after `setActive()`:

```typescript
import { useClerk } from '@clerk/clerk-expo';

// In SignUpScreen component:
const clerk = useClerk();

// In handleVerify():
await setActive({ session: result.createdSessionId });
await clerk.load(); // Force reload Clerk instance
await new Promise(resolve => setTimeout(resolve, 100));
```

**Why:** Manually trigger Clerk to reload its state from the session

---

### Fix C: Check Session Status 🔍
**File:** `mobile/src/screens/SignUpScreen.tsx`

Add after `attemptEmailAddressVerification()`:

```typescript
console.log('[SignUp] Full result:', JSON.stringify(result, null, 2));
console.log('[SignUp] Session object:', result.createdSession);
console.log('[SignUp] Session status:', result.createdSession?.status);

if (result.createdSession?.status !== 'active') {
  console.error('[SignUp] Session not active:', result.createdSession?.status);
  setError(`Session status: ${result.createdSession?.status}. Please try again.`);
  return;
}
```

**Why:** Verify session is actually "active" before calling setActive()

---

### Fix D: Use Session Object Instead of ID 🆔
**File:** `mobile/src/screens/SignUpScreen.tsx`

```typescript
// Instead of:
await setActive({ session: result.createdSessionId });

// Try:
if (result.createdSession) {
  await setActive({ session: result.createdSession });
}
```

**Why:** Pass the full session object instead of just the ID

---

### Fix E: Disable Email Verification (Test Only) 🧪
**Clerk Dashboard:**
1. Go to Settings → Email, Phone, Username
2. Find "Email address" section
3. Toggle OFF "Require verification"
4. Save changes

**Test:**
1. Sign up with new email
2. Check if navigation works immediately after sign-up
3. If it works → issue is with verification flow
4. If it doesn't work → issue is broader (sign-up flow)

**Important:** Re-enable verification after testing

---

### Fix F: Clear Clerk Cache Completely 🗑️
**File:** `mobile/App.tsx`

Update `CLERK_CACHE_KEYS`:

```typescript
const CLERK_CACHE_KEYS = [
  '__clerk_client_jwt',
  '__clerk_session_id',
  '__clerk_session',
  '__clerk_client',
  '__clerk_user',           // ADD
  '__clerk_organization',   // ADD
  '__clerk_dev_browser',    // ADD
  'clerk_token',
  'talor_auth_token',
  'talor_clerk_token',
];
```

**Then:**
```bash
# Stop app completely
# Clear bundler cache
npx expo start --clear

# In simulator: Delete app, reinstall
# Hardware → Erase All Content and Settings (nuclear option)
```

---

### Fix G: Monitor Clerk Instance Directly 👁️
**File:** `mobile/App.tsx`

Add monitoring component:

```typescript
import { useClerk, useAuth } from '@clerk/clerk-expo';

function ClerkDebugMonitor() {
  const clerk = useClerk();
  const auth = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[ClerkMonitor]', {
        loaded: clerk.loaded,
        session: clerk.session?.id,
        user: clerk.user?.id,
        isSignedIn: auth.isSignedIn,
        userId: auth.userId,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

// Add to AppContent:
<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
  <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
    <SafeAreaProvider>
      <ThemeProvider>
        <ClerkDebugMonitor />  {/* ADD THIS */}
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
</ClerkProvider>
```

**Why:** See Clerk state updating in real-time every second

---

## Testing Priority Order

Run tests in this order:

1. ✅ **Test UI (Buttons Visible)** → Should be fixed
2. ✅ **Test with Valid Code** → Check console logs
3. ❌ If navigation fails → Apply **Fix A** (increase delay)
4. ❌ If still fails → Apply **Fix B** (force reload)
5. ❌ If still fails → Apply **Fix C** (check session status)
6. ❌ If still fails → Apply **Fix D** (use session object)
7. ❌ If still fails → Apply **Fix E** (disable verification)
8. ❌ If still fails → Apply **Fix F** (clear cache)
9. ❌ If still fails → Apply **Fix G** (add monitor)
10. ❌ If still fails → Contact Clerk support with logs

---

## Key Console Logs to Watch

### Critical Success Indicators:
- ✅ `createdSessionId: "sess_..."` (not null)
- ✅ `Setting active session: sess_...`
- ✅ `isSignedIn: true` (appears within 500ms)
- ✅ `userId: "user_..."` (appears within 500ms)
- ✅ `willShow: "MAIN APP"`

### Critical Failure Indicators:
- ❌ `createdSessionId: null`
- ❌ `isSignedIn: false` (stays false after 500ms)
- ❌ `userId: null` (stays null after 500ms)
- ❌ `willShow: "AUTH SCREEN"` (after verification)
- ❌ `No token available despite isAuthenticated=true`

---

## Expected Timeline

**Optimal Flow:**
- T+0ms: User taps "Verify & Continue"
- T+50ms: `attemptEmailAddressVerification()` completes
- T+60ms: `setActive()` called
- T+70ms: `setActive()` completes
- T+170ms: 100ms delay finishes
- T+180ms: Clerk context updates `isSignedIn` → `true`
- T+190ms: AppNavigator re-renders
- T+200ms: User sees Home screen

**Total time:** ~200ms from button tap to main app

**If taking longer than 500ms:** Check console for stuck state

---

## Fallback: Manual Navigation (Last Resort)

If Clerk state never updates, add manual navigation:

**File:** `mobile/src/screens/SignUpScreen.tsx`

```typescript
import { CommonActions } from '@react-navigation/native';

// In handleVerify():
await setActive({ session: result.createdSessionId });
await new Promise(resolve => setTimeout(resolve, 500));

// If still not signed in after delay, force navigation
const { isSignedIn, userId } = useAuth();
if (!isSignedIn && !userId) {
  console.warn('[SignUp] Clerk state not updated, forcing navigation...');

  // Force reset navigation to main app
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })
  );
}
```

**Warning:** This bypasses proper auth state and may cause issues. Only use as last resort for testing.

---

## Success Criteria

### ✅ All Tests Pass:
- Verification screen displays correctly
- Buttons visible and tappable
- Console shows session creation
- Console shows `isSignedIn: true`
- User navigates to main app
- Token synced to SecureStore

### Next Steps:
- Test sign-out flow
- Test sign-in flow (existing user)
- Test resume upload
- Test API authenticated requests

---

## Failure Escalation

If all fixes fail:

1. **Collect logs:**
   - Full console output from launch to failed verification
   - Clerk Dashboard → Logs → Copy session creation event
   - Screenshot of verification screen

2. **Test alternative flow:**
   - Disable email verification in Clerk Dashboard
   - Test sign-up without verification
   - Test sign-in with existing account

3. **Contact Clerk Support:**
   - Email: support@clerk.com
   - Include: Clerk publishable key, user ID, session ID, full logs
   - Reference: "React Native session activation not updating context"

4. **Consider alternative auth:**
   - Switch to phone verification
   - Use OAuth (Google, Apple) instead
   - Use magic link instead of email code

---

## Document Version
- **Created:** 2026-02-13
- **Last Updated:** 2026-02-13
- **Status:** Active Testing
- **Priority:** P0 (Blocking user sign-up)
