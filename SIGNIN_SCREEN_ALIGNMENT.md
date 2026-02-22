# Sign In Screen Visual Alignment
## Mobile vs Web Comparison & Action Plan

**Date:** February 22, 2026
**Screen:** Sign In (Authentication)
**Priority:** HIGH (Critical user flow)

---

## 📊 Current State Comparison

### Layout Structure

| Element | Mobile | Web | Match? |
|---------|--------|-----|--------|
| **Container** | SafeAreaView + ScrollView | Full screen centered | ⚠️ Different structure |
| **Glass Card** | BlurView 16px radius | Glass div 16px radius | ✅ Matches |
| **Card Padding** | 32px | 32px | ✅ Matches |
| **Logo/Branding** | ❌ None | ✅ FileText + "Talor" | ❌ Web only |
| **Title** | "Welcome Back" 32px | "Welcome back" 20px | ❌ Different size |
| **Subtitle** | 16px | 14px | ⚠️ Different size |
| **Input Height** | 52px explicit | Auto (py-2.5) | ❌ Different |
| **Input Icons** | 20px | 16px | ❌ Different |
| **Button Height** | 52px | Auto (py-3) | ❌ Different |
| **Button Icon** | 20px | 16px | ❌ Different |
| **Error Container** | 12px radius, 16px padding | 12px radius, 12px padding | ⚠️ Different padding |

---

## 🎯 Visual Consistency Issues

### Issue 1: Title Size Mismatch

**Mobile:**
```tsx
title: {
  fontSize: 32,
  fontFamily: FONTS.bold,
}
```

**Web:**
```tsx
<h1 className="text-xl font-semibold">  // 20px
  Welcome back
</h1>
```

**Target:**
- Both should use 32px title (text-3xl on web)
- Use same capitalization ("Welcome Back")

---

### Issue 2: Input Icon Size Mismatch

**Mobile:**
```tsx
<Mail color={COLORS.dark.textTertiary} size={20} />
<Lock color={COLORS.dark.textTertiary} size={20} />
```

**Web:**
```tsx
<Mail className="w-4 h-4" />  // 16px
<Lock className="w-4 h-4" />  // 16px
```

**Target:**
- Web icons should be 20px (w-5 h-5) to match mobile

---

### Issue 3: Input Height Not Explicit on Web

**Mobile:**
```tsx
inputWrapper: {
  borderRadius: RADIUS.md,  // 12px
  paddingHorizontal: SPACING.md,  // 16px
  height: 52,  // Explicit height
}
```

**Web:**
```tsx
className="py-2.5"  // 10px vertical padding (auto height)
```

**Target:**
- Web should use explicit height: `h-[52px]` or `min-h-[52px]`
- Remove variable padding, use fixed height

---

### Issue 4: Button Height Not Explicit on Web

**Mobile:**
```tsx
signInButton: {
  borderRadius: RADIUS.md,  // 12px
  height: 52,  // Explicit height
  gap: SPACING.sm,  // 12px
}
```

**Web:**
```tsx
className="py-3"  // 12px vertical padding (auto height)
```

**Target:**
- Web should use explicit height: `h-[52px]`
- Button icon should be 20px (w-5 h-5) not 16px

---

### Issue 5: Subtitle Size Mismatch

**Mobile:**
```tsx
subtitle: {
  fontSize: 16,
  fontFamily: FONTS.regular,
}
```

**Web:**
```tsx
<p className="text-sm">  // 14px
  Sign in to your account
</p>
```

**Target:**
- Web should use text-base (16px) to match mobile

---

### Issue 6: Error Container Padding

**Mobile:**
```tsx
errorContainer: {
  borderRadius: RADIUS.md,  // 12px
  padding: SPACING.md,  // 16px
}
```

**Web:**
```tsx
className="rounded-lg p-3"  // 12px radius, 12px padding
```

**Target:**
- Web should use p-4 (16px) to match mobile

---

## 🔧 Required Changes

### Mobile Changes

**File:** `mobile/src/screens/SignInScreen.tsx`

**No changes needed** - Mobile already uses correct sizes ✅
- Input height: 52px ✅
- Button height: 52px ✅
- Icons: 20px ✅
- Title: 32px ✅
- Subtitle: 16px ✅
- Border radius: 12px (md) ✅
- Error padding: 16px ✅

---

### Web Changes

**File:** `web/src/pages/SignIn.tsx`

1. **Fix title size**
   ```tsx
   // BEFORE (line ~36)
   <h1 className="text-xl font-semibold text-theme text-center mb-2">Welcome back</h1>

   // AFTER
   <h1 className="text-3xl font-bold text-theme text-center mb-2">Welcome Back</h1>
   ```

2. **Fix subtitle size**
   ```tsx
   // BEFORE (line ~37)
   <p className="text-theme-secondary text-sm text-center mb-6">Sign in to your account</p>

   // AFTER
   <p className="text-theme-secondary text-base text-center mb-6">Sign in to your account</p>
   ```

3. **Fix input icon sizes**
   ```tsx
   // BEFORE (lines ~50, 66)
   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-tertiary" />

   // AFTER
   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
   ```

4. **Fix input heights**
   ```tsx
   // BEFORE (lines ~57, 73)
   className="w-full pl-10 pr-4 py-2.5 bg-theme-glass-10 border border-theme-muted text-theme rounded-lg"

   // AFTER
   className="w-full pl-10 pr-4 h-[52px] bg-theme-glass-10 border border-theme-muted text-theme rounded-lg"
   ```

5. **Fix button height and icon**
   ```tsx
   // BEFORE (line ~82)
   className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg"
   {loading && <Loader2 className="w-4 h-4 animate-spin" />}

   // AFTER
   className="w-full h-[52px] bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg"
   {loading && <Loader2 className="w-5 h-5 animate-spin" />}
   ```

6. **Fix error padding**
   ```tsx
   // BEFORE (line ~42)
   className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"

   // AFTER
   className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
   ```

**Estimated Changes:** 8 lines

---

## ✅ Implementation Checklist

### Phase 1: Mobile Verification (5 min)

- [x] Mobile already uses correct sizes
- [x] No changes needed
- [x] Document current state ✅

### Phase 2: Web Fixes (15 min)

- [ ] Fix title (text-xl → text-3xl, "Welcome back" → "Welcome Back")
- [ ] Fix subtitle (text-sm → text-base)
- [ ] Fix input icons (w-4 h-4 → w-5 h-5) - 2 instances
- [ ] Fix input heights (py-2.5 → h-[52px]) - 2 instances
- [ ] Fix button height (py-3 → h-[52px])
- [ ] Fix button loader icon (w-4 h-4 → w-5 h-5)
- [ ] Fix error padding (p-3 → p-4)
- [ ] Test in Chrome
- [ ] Take screenshot for comparison

### Phase 3: Visual QA (10 min)

- [ ] Compare title sizes (should be 32px)
- [ ] Verify input heights (should be 52px)
- [ ] Verify button height (should be 52px)
- [ ] Verify icon sizes (should be 20px)
- [ ] Verify subtitle (should be 16px)
- [ ] Test sign in functionality
- [ ] Test error display
- [ ] Document acceptable differences

---

## 📏 Target Measurements

After alignment, both platforms should have:

| Element | Target Value |
|---------|--------------|
| **Container radius** | 16px (lg) |
| **Container padding** | 32px |
| **Title size** | 32px (text-3xl) |
| **Subtitle size** | 16px (text-base) |
| **Input height** | 52px |
| **Input border radius** | 12px (md) |
| **Input icons** | 20px |
| **Button height** | 52px |
| **Button border radius** | 12px (md) |
| **Button icon** | 20px |
| **Error padding** | 16px |
| **Error radius** | 12px |

---

## 🐛 Known Issues to Fix

### Mobile
✅ No issues - all sizes correct

### Web
1. ❌ Title is 20px (should be 32px)
2. ❌ Title text is "Welcome back" (should be "Welcome Back")
3. ❌ Subtitle is 14px (should be 16px)
4. ❌ Input icons are 16px (should be 20px)
5. ❌ Input heights use padding (should be explicit 52px)
6. ❌ Button height uses padding (should be explicit 52px)
7. ❌ Button loader icon is 16px (should be 20px)
8. ❌ Error padding is 12px (should be 16px)

---

## 📝 Acceptable Platform Differences

These differences are intentional and should NOT be changed:

1. **Branding Logo:**
   - Mobile: No logo (title only)
   - Web: FileText icon + "Talor" wordmark
   - **Reason:** Web needs branding on standalone page, mobile has app icon ✅

2. **Container Structure:**
   - Mobile: SafeAreaView + KeyboardAvoidingView + ScrollView
   - Web: Centered flex container
   - **Reason:** Platform-appropriate patterns ✅

3. **Password Toggle:**
   - Mobile: Eye/EyeOff icon button (explicit implementation)
   - Web: Native browser password toggle (HTML type="password")
   - **Reason:** Web leverages browser capabilities ✅

4. **Subtitle Text:**
   - Mobile: "Sign in to continue with Talor"
   - Web: "Sign in to your account"
   - **Reason:** Different context/phrasing (acceptable) ✅

---

## 📝 Post-Implementation Verification

### Visual Checklist
- [ ] Title identical size (32px)
- [ ] Subtitle identical size (16px)
- [ ] Input heights identical (52px)
- [ ] Button height identical (52px)
- [ ] Icons identical size (20px)
- [ ] Error padding identical (16px)
- [ ] Border radius consistent (12px inputs/buttons, 16px container)

### Functionality Checklist
- [ ] Sign in works correctly
- [ ] Email validation works
- [ ] Password validation works
- [ ] Error messages display correctly
- [ ] Loading state shows correctly
- [ ] Navigation to sign up works
- [ ] Keyboard handling works (mobile)
- [ ] Focus states work (web)

---

**Last Updated:** February 22, 2026
**Status:** Ready for implementation
**Estimated Time:** 30 minutes total
