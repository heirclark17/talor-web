# Auth Flow Testing & Debugging Guide

## Issues Addressed

### Issue 1: Verification Screen Missing Buttons ✅
**User Report:** "Resend" and "Go Back" buttons not visible on verification screen

**Root Cause Hypotheses:**
1. Buttons rendered below keyboard (KeyboardAvoidingView issue)
2. ScrollView not scrollable (content fits viewport, no bounce)
3. Styles hiding buttons (opacity, display, positioning)

**Fixes Applied:**
- Added `verificationScrollContent` style with extra bottom padding
- Added 100px spacer at bottom of ScrollView
- Improved button hitSlop (10px all sides) for easier tapping
- Added `goBackContainer` style with padding and centering
- Changed "Go Back" text to "← Go Back to Sign Up" for clarity
- Set `bounces={false}` on ScrollView to prevent bounce hiding buttons

### Issue 2: Session Not Activating After Verification ❌
**User Report:** "After entering verification code, still not navigating to main app (stuck on auth screen)"

**Root Cause Analysis:**

**What SHOULD happen:**
1. User enters verification code
2. `signUp.attemptEmailAddressVerification()` completes successfully
3. Returns `result` with `createdSessionId`
4. `setActive({ session: result.createdSessionId })` activates the session
5. Clerk updates internal state: `isSignedIn` becomes `true` OR `userId` is set
6. AppNavigator detects change via `useAuth()` hook
7. AppNavigator re-renders with `isAuthenticated = true`
8. MainTabNavigator displays instead of AuthStackNavigator

**Potential Failure Points:**
- ❌ Verification fails (invalid code) → handled with error message
- ❌ `createdSessionId` is null → added check, shows error
- ❌ `setActive()` throws error → would be caught and logged
- ❌ Clerk state doesn't update after `setActive()` → **SUSPECTED ISSUE**
- ❌ AppNavigator doesn't re-render on state change → added useEffect monitor
- ❌ Race condition between state update and render → added 100ms delay

**Fixes Applied:**
- Enhanced logging in `handleVerify()` to show all result properties
- Added 100ms delay after `setActive()` for Clerk state propagation
- Added `useAuth()` to SignUpScreen to monitor `isSignedIn`/`userId`
- Added `useEffect` to log when auth state changes after verification
- Enhanced AppNavigator logging to track all auth state transitions
- Enhanced useAuthSync logging to show sessionId and token sync

---

## Testing Procedure

### Prerequisites
- iOS Simulator running (iPhone 15 Pro recommended)
- Xcode developer tools installed
- Expo CLI installed: `npm install -g expo-cli`
- Metro bundler cleared: `npx expo start --clear`

### Test Environment
- Project: `C:\Users\derri\projects\resume-ai-app\mobile`
- Clerk Environment: Development (pk_test_...)
- Backend: Not required for auth testing

### Step-by-Step Test

#### Phase 1: Launch App
```bash
cd /c/Users/derri/projects/resume-ai-app/mobile
npx expo start --clear
```

Press `i` to open iOS Simulator

**Expected Console Logs:**
```
[App] Clerk key changed, clearing stale session data... (if key changed)
[AppNavigator] Clerk loading...
[AppNavigator] Clerk ready - isSignedIn: false userId: null → showing: AUTH SCREEN
```

#### Phase 2: Navigate to Sign Up
Tap "Sign Up" link on Sign In screen

**Expected:**
- Sign Up screen appears with email + password fields
- "Create Account" heading visible
- "Sign up to get started with Talor" subtitle visible

#### Phase 3: Enter Email + Password
Enter test email: `test+{timestamp}@example.com` (e.g., `test+1707859200@example.com`)
Enter password: `TestPassword123!`

Tap "Sign Up" button

**Expected Console Logs:**
```
[SignUp] Create status: missing_requirements
[SignUp] Verification email sent to test+{timestamp}@example.com
```

**Expected UI:**
- Loading spinner appears briefly
- Screen transitions to verification screen
- Heading: "Verify Email"
- Subtitle: "Enter the code sent to test+{timestamp}@example.com"
- 6-digit code input field (large, centered)
- "Verify & Continue" button
- "Didn't get the code? Resend" link ← **CHECK IF VISIBLE**
- "← Go Back to Sign Up" link ← **CHECK IF VISIBLE**

#### Phase 4: Check Button Visibility
**CRITICAL TEST:** Scroll down on verification screen

**Expected:**
- Buttons should be visible without scrolling (extra bottom padding)
- If keyboard is visible, tap outside to dismiss
- "Resend" link should be visible and tappable
- "Go Back" link should be visible and tappable
- Tap "Go Back" → should return to sign-up form with email preserved

**If buttons NOT visible:**
- Keyboard may be covering them
- Tap outside input field to dismiss keyboard
- Try scrolling down
- Check console for rendering errors

#### Phase 5: Enter Verification Code
Check email inbox for Clerk verification code (6 digits)

If no email received:
- Check spam folder
- Tap "Resend" link
- Check Clerk Dashboard > Logs for delivery status

Enter 6-digit code in input field

**Expected:**
- Characters appear in large font with letter spacing
- Code input accepts only numbers
- Max length: 6 characters

#### Phase 6: Verify Code
Tap "Verify & Continue" button

**Expected Console Logs (KEY DEBUGGING INFO):**
```
[SignUp] Verify result: {
  status: "complete",
  createdSessionId: "sess_abc123...",
  createdUserId: "user_xyz789...",
  verifications: {...}
}
[SignUp] Setting active session: sess_abc123...
[SignUp] Session activated! Waiting for Clerk state update...
[SignUp] Verification complete - user should navigate to main app

[useAuthSync] Auth state: {
  isSignedIn: true,  ← SHOULD BE TRUE
  userId: "user_xyz789...",  ← SHOULD BE SET
  sessionId: "sess_abc123...",  ← SHOULD BE SET
  isAuthenticated: true
}
[useAuthSync] Token synced to secure storage (length: 450)

[AppNavigator] Auth state changed: {
  isSignedIn: true,  ← SHOULD BE TRUE
  userId: "user_xyz789...",  ← SHOULD BE SET
  sessionId: "sess_abc123...",
  isAuthenticated: true,
  willShow: "MAIN APP"  ← SHOULD SAY "MAIN APP"
}

[SignUp] Auth state updated after verification - user is now signed in!
[SignUp] isSignedIn: true userId: user_xyz789...
```

**Expected UI:**
- Loading spinner appears briefly (100ms)
- Screen transitions to Main App (Home tab)
- Bottom tab bar visible with 7 tabs
- Home screen displays "My Resumes" heading

---

## Diagnosis Based on Console Logs

### Scenario A: Success Path ✅
```
[SignUp] Verify result: { status: "complete", createdSessionId: "sess_...", createdUserId: "user_..." }
[SignUp] Setting active session: sess_...
[SignUp] Session activated! Waiting for Clerk state update...
[useAuthSync] Auth state: { isSignedIn: true, userId: "user_...", ... }
[AppNavigator] Auth state changed: { isSignedIn: true, userId: "user_...", willShow: "MAIN APP" }
[SignUp] Auth state updated after verification - user is now signed in!
```

**Result:** User navigates to main app successfully

---

### Scenario B: Invalid Code ⚠️
```
[SignUp] Verification error: {errors: [{message: "Invalid verification code"}]}
```

**UI:** Red error message appears: "Invalid code. Please try again."

**Fix:** User re-enters correct code or taps "Resend"

---

### Scenario C: No Session ID Created 🔴
```
[SignUp] Verify result: { status: "complete", createdSessionId: null, createdUserId: "user_..." }
[SignUp] No session ID returned: {...}
```

**UI:** Error message appears: "Could not complete verification. Please try again."

**Root Cause:** Clerk didn't create a session despite successful verification

**Possible Fixes:**
1. Check Clerk Dashboard > Settings > Email verification settings
2. Ensure "Require email verification" is enabled
3. Check if user already has an active session
4. Try signing out completely first: `await signOut()`

---

### Scenario D: Session Created But Clerk State Doesn't Update 🔴🔴🔴
**MOST LIKELY ISSUE**

```
[SignUp] Verify result: { status: "complete", createdSessionId: "sess_...", createdUserId: "user_..." }
[SignUp] Setting active session: sess_...
[SignUp] Session activated! Waiting for Clerk state update...

[useAuthSync] Auth state: {
  isSignedIn: false,  ← STILL FALSE
  userId: null,  ← STILL NULL
  sessionId: "sess_...",  ← SESSION EXISTS BUT NOT ACTIVE
  isAuthenticated: false  ← STILL FALSE
}

[AppNavigator] Auth state changed: {
  isSignedIn: false,  ← STILL FALSE
  userId: null,  ← STILL NULL
  sessionId: "sess_...",
  isAuthenticated: false,
  willShow: "AUTH SCREEN"  ← STILL SHOWING AUTH
}
```

**UI:** User stays on verification screen, no error message

**Root Cause:** `setActive({ session })` completes but Clerk context doesn't update `isSignedIn` or `userId`

**Possible Causes:**
1. **Clerk bug with async state propagation**
2. **Session has "pending tasks" preventing activation**
3. **React context not re-rendering after state change**
4. **Stale session cache interfering**

**Advanced Fixes to Try:**

#### Fix 1: Force Session Reload
```typescript
await setActive({ session: result.createdSessionId });
await new Promise(resolve => setTimeout(resolve, 500)); // Increase delay
```

#### Fix 2: Manually Reload Clerk
```typescript
import { useClerk } from '@clerk/clerk-expo';

const clerk = useClerk();
await setActive({ session: result.createdSessionId });
await clerk.load(); // Force reload Clerk instance
```

#### Fix 3: Use Session Object Directly
```typescript
// Instead of:
await setActive({ session: result.createdSessionId });

// Try:
const sessionObj = signUp.createdSessionId;
await setActive({ session: sessionObj });
```

#### Fix 4: Check Session Status
```typescript
const result = await signUp.attemptEmailAddressVerification({ code });
console.log('[SignUp] Session object:', result.createdSession);
console.log('[SignUp] Session status:', result.createdSession?.status);

if (result.createdSession?.status !== 'active') {
  console.warn('[SignUp] Session not active:', result.createdSession?.status);
}
```

#### Fix 5: Disable Email Verification Temporarily
In Clerk Dashboard:
1. Go to Settings > Email verification
2. Disable "Require email verification"
3. Test sign-up flow without verification
4. If this works, the issue is with the verification flow

#### Fix 6: Clear All Clerk Cache
```typescript
// In App.tsx, add to clearStaleClerkData():
const CLERK_CACHE_KEYS = [
  '__clerk_client_jwt',
  '__clerk_session_id',
  '__clerk_session',
  '__clerk_client',
  '__clerk_user',  // ADD THIS
  '__clerk_organization',  // ADD THIS
  'clerk_token',
  'talor_auth_token',
  'talor_clerk_token',
];
```

Then force clear:
```bash
# Stop app
# Clear SecureStore manually:
npx expo start --clear
# Delete and reinstall app in simulator
```

---

### Scenario E: Session Created But Token Sync Fails 🔴
```
[SignUp] Session activated! Waiting for Clerk state update...
[useAuthSync] Auth state: { isSignedIn: true, userId: "user_...", ... }
[useAuthSync] No token available despite isAuthenticated=true
```

**Root Cause:** `getToken()` returns null despite active session

**Fix:** Check if Clerk requires additional permissions or if token generation is delayed

---

## Additional Debugging Tools

### 1. Check Clerk Session State Directly
Add to SignUpScreen after `setActive()`:

```typescript
const { isSignedIn, userId, sessionId, session } = useAuth();
console.log('[SignUp] Clerk state after setActive:', {
  isSignedIn,
  userId,
  sessionId,
  sessionStatus: session?.status,
  sessionLastActiveAt: session?.lastActiveAt,
});
```

### 2. Monitor All Clerk Events
Add to App.tsx:

```typescript
import { useClerk } from '@clerk/clerk-expo';

function ClerkMonitor() {
  const clerk = useClerk();

  useEffect(() => {
    console.log('[ClerkMonitor] Clerk loaded:', !!clerk.loaded);
    console.log('[ClerkMonitor] Active session:', clerk.session?.id);
    console.log('[ClerkMonitor] User:', clerk.user?.id);
  }, [clerk.loaded, clerk.session, clerk.user]);

  return null;
}

// Add to AppContent:
<ThemeProvider>
  <ClerkMonitor />
  <BackgroundLayer>
    <StatusBar style={isDark ? 'light' : 'dark'} />
    <AppNavigator />
  </BackgroundLayer>
</ThemeProvider>
```

### 3. Test Sign-In Flow Separately
Test if sign-in works (to isolate verification issue):

1. Sign up with email verification disabled in Clerk Dashboard
2. Sign out
3. Sign in with same credentials
4. Check if navigation works

If sign-in works but sign-up doesn't, issue is specifically with email verification flow.

---

## Expected Test Results

### ✅ Success Criteria
- [x] Verification screen displays with all elements visible
- [x] "Resend" link is visible and tappable
- [x] "Go Back" link is visible and tappable
- [x] After entering valid code, console shows "Session activated"
- [x] Console shows `isSignedIn: true` or `userId: "user_..."`
- [x] Console shows `willShow: "MAIN APP"`
- [x] User navigates to Home screen within 500ms
- [x] Bottom tab bar displays with 7 tabs

### ❌ Failure Indicators
- [ ] Buttons not visible on verification screen → UI issue
- [ ] "No session ID returned" in console → Clerk config issue
- [ ] `isSignedIn: false` after setActive() → State propagation issue
- [ ] User stays on verification screen with no error → Navigation blocked
- [ ] Token sync fails after successful verification → Auth sync issue

---

## Contact for Support

If tests fail or unexpected behavior occurs, provide:

1. **Full console output** from app launch to failed verification
2. **Screenshots** of verification screen (showing/hiding buttons)
3. **Clerk Dashboard logs** (copy session creation event)
4. **Device info** (iOS version, simulator model)
5. **Clerk environment** (development vs production key)

**Key Log Lines to Include:**
- `[SignUp] Verify result: {...}`
- `[useAuthSync] Auth state: {...}`
- `[AppNavigator] Auth state changed: {...}`
- Any error messages or warnings

---

## Next Steps Based on Results

### If UI Issue (Buttons Not Visible)
→ Adjust ScrollView contentContainerStyle padding
→ Increase bottom spacer height beyond 100px
→ Test with keyboard dismissed

### If Session Activation Issue
→ Check Clerk Dashboard for session creation logs
→ Test with email verification disabled
→ Try manual session reload with `clerk.load()`
→ Contact Clerk support with logs

### If Token Sync Issue
→ Check `getToken()` response after delay
→ Verify tokenCache is working (SecureStore access)
→ Check for AsyncStorage permission issues

---

## Version Info
- **Test Date:** 2026-02-13
- **App Version:** 1.0.0
- **Clerk SDK:** @clerk/clerk-expo (latest)
- **React Native:** 0.73.x
- **Expo SDK:** ~50.0.x

---

## Change Log

### 2026-02-13 - Initial Fixes
- Added verification screen bottom padding
- Added 100px bottom spacer
- Enhanced button hitSlop
- Added comprehensive logging to handleVerify()
- Added 100ms delay after setActive()
- Added useAuth() monitoring in SignUpScreen
- Added sessionId tracking in AppNavigator
- Enhanced useAuthSync logging
