# Interview Prep Screen Visual Alignment
## Mobile vs Web Comparison & Action Plan

**Date:** February 22, 2026
**Screen:** Interview Preparation
**Priority:** HIGH (Core feature)

---

## 📊 Current State Comparison

### Layout Structure

| Element | Mobile | Web | Match? |
|---------|--------|-----|--------|
| **Header** | SafeAreaView with back button | Container with back link | ⚠️ Different structure |
| **Loading State** | ActivityIndicator center | Glass card with loader | ⚠️ Different design |
| **Error State** | Alert dialogs | Glass card with error | ⚠️ Different design |
| **Job Info Card** | GlassCard 20px radius | Glass div 16px radius | ❌ Different radius |
| **Section Cards** | GlassCard 20px radius | Glass div 16px radius | ❌ Different radius |
| **Action Buttons** | 48px height, 12px radius | 44px height, responsive | ⚠️ Different sizing |
| **Toolbar Buttons** | N/A on mobile | Responsive px-3 sm:px-4 | ❌ Responsive on web |
| **Typography** | Fixed sizes | Responsive sizing | ❌ Different |
| **Icons** | Fixed 24px | Responsive 20-24px | ⚠️ Different |

---

## 🎯 Visual Consistency Issues

### Issue 1: Card Border Radius Mismatch

**Mobile:**
```tsx
<GlassCard
  material="thin"
  borderRadius={RADIUS.xl}  // 20px
  style={styles.individualCard}
>
// All section cards use 20px radius
```

**Web:**
```tsx
<div className="glass rounded-2xl p-6">  // 16px
// Some cards use rounded-3xl (24px)
// Inconsistent with mobile's 20px
```

**Target:**
- Mobile: Keep RADIUS.xl (20px) for large cards ✅
- Web: Change to `rounded-2xl` (16px) consistently
- **Decision:** Standardize both platforms to 16px (lg radius in design system)

---

### Issue 2: Action Button Heights

**Mobile:**
```tsx
actionButton: {
  paddingVertical: SPACING.md,  // 16px
  paddingHorizontal: SPACING.sm,  // 12px
  borderRadius: RADIUS.md,  // 12px
  minHeight: 48,  // md size button
}
```

**Web:**
```tsx
// Back button
className="min-h-[44px]"  // 44px (below standard)

// Toolbar buttons
className="px-3 sm:px-4 py-2 min-h-[44px]"  // Responsive
```

**Target:**
- All buttons should be 48px minimum height (md standard)
- Remove responsive sizing from toolbar buttons
- Consistent border radius: 12px (md)

---

### Issue 3: Responsive Typography on Web

**Web uses extensive responsive text:**
```tsx
// Page title
className="text-2xl sm:text-3xl lg:text-4xl"  // 24px/32px/36px

// Section headers
className="text-lg sm:text-xl"  // 18px/20px

// Body text
className="text-sm sm:text-base"  // 14px/16px

// Icons
className="w-5 h-5 sm:w-6 sm:h-6"  // 20px/24px
```

**Target:** Remove all responsive sizing
- Page title: `text-3xl` (32px fixed)
- Section headers: `text-xl` (20px fixed)
- Body text: `text-base` (16px fixed)
- Icons: `w-6 h-6` (24px fixed)

---

### Issue 4: Card Padding Responsive Sizing

**Mobile:** Fixed padding using SPACING constants
```tsx
padding: SPACING.lg,  // 24px always
```

**Web:** Responsive padding
```tsx
className="p-4 sm:p-6"  // 16px → 24px
className="glass rounded-2xl p-4 sm:p-6"
```

**Target:**
- Standardize to `p-6` (24px) for all cards
- Remove `sm:` responsive variants

---

### Issue 5: Toolbar Button Responsive Classes

**Web:**
```tsx
<button className="px-3 sm:px-4 py-2 rounded-lg min-h-[44px]">
// Same responsive padding issue as Tailor screen
```

**Target:**
- Change to `px-4 py-2` (fixed 16px horizontal)
- Update min-height to `min-h-[48px]`
- Remove all `sm:` responsive variants

---

### Issue 6: Icon Container Sizes

**Mobile:**
```tsx
stackedCardIcon: {
  width: 48,
  height: 48,
  borderRadius: SPACING.radiusMD,  // 12px
}
// Icon inside: 24px
```

**Web:**
```tsx
<div className="p-2 rounded-lg">
  <Target className="w-6 h-6" />  // 24px icon
// Container auto-sized by padding
```

**Target:**
- Both should use 48x48px icon containers
- Icon size: 24px inside container
- Border radius: 12px (md)

---

## 🔧 Required Changes

### Mobile Changes

**File:** `mobile/src/screens/InterviewPrepScreen.tsx`

1. **Change card border radius from xl to lg**
   ```tsx
   // BEFORE (lines ~324, 362, 407, etc.)
   borderRadius={RADIUS.xl}  // 20px

   // AFTER
   borderRadius={RADIUS.lg}  // 16px (standardized)
   ```

2. **Verify action button already uses md (48px)** ✅
   - Line 1072: `minHeight: 48` - correct
   - No changes needed

**Estimated Changes:** ~15 instances of RADIUS.xl → RADIUS.lg

---

### Web Changes

**File:** `web/src/pages/InterviewPrep.tsx`

1. **Remove responsive from page title**
   ```tsx
   // BEFORE (line ~846)
   className="text-2xl sm:text-3xl lg:text-4xl font-bold"

   // AFTER
   className="text-3xl font-bold"  // Fixed 32px
   ```

2. **Remove responsive from subtitle**
   ```tsx
   // BEFORE (line ~847)
   className="text-sm sm:text-base text-theme-secondary"

   // AFTER
   className="text-base text-theme-secondary"  // Fixed 16px
   ```

3. **Fix back button height**
   ```tsx
   // BEFORE (line ~821)
   className="min-h-[44px]"

   // AFTER
   className="min-h-[48px]"  // Standard md button height
   ```

4. **Fix toolbar buttons (multiple locations)**
   ```tsx
   // BEFORE (lines ~857, 864, 871, 880)
   className="px-3 sm:px-4 py-2 rounded-lg min-h-[44px]"

   // AFTER
   className="px-4 py-2 rounded-lg min-h-[48px]"
   ```

5. **Remove responsive from card padding**
   ```tsx
   // BEFORE (lines ~919, 944, etc.)
   className="glass rounded-2xl p-4 sm:p-6"

   // AFTER
   className="glass rounded-2xl p-6"  // Fixed 24px padding
   ```

6. **Remove responsive from section headers**
   ```tsx
   // BEFORE (lines ~922, 945, etc.)
   className="text-lg sm:text-xl font-bold"

   // AFTER
   className="text-xl font-bold"  // Fixed 20px
   ```

7. **Remove responsive from icons**
   ```tsx
   // BEFORE (line ~921)
   <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />

   // AFTER
   <Calendar className="w-6 h-6" />  // Fixed 24px
   ```

8. **Remove responsive from large cards (rounded-3xl)**
   ```tsx
   // BEFORE (lines ~772, 799)
   className="glass rounded-3xl p-8"

   // AFTER
   className="glass rounded-2xl p-6"  // Standardized to 16px radius, 24px padding
   ```

9. **Standardize all card radii to rounded-2xl (16px)**
   - Search for `rounded-3xl` and change to `rounded-2xl`
   - Verify all glass cards use consistent 16px radius

**Estimated Changes:** 40-50 lines across multiple sections

---

## ✅ Implementation Checklist

### Phase 1: Mobile Fixes (15 min)

- [ ] Change all `borderRadius={RADIUS.xl}` to `borderRadius={RADIUS.lg}` in GlassCard components
- [ ] Search for RADIUS.xl pattern (15+ instances)
- [ ] Test on iOS simulator
- [ ] Verify cards now have 16px radius
- [ ] Take screenshot for comparison

### Phase 2: Web Fixes (60 min)

- [ ] Fix page title (remove responsive sizing)
- [ ] Fix subtitle (remove responsive sizing)
- [ ] Fix back button (44px → 48px)
- [ ] Fix toolbar buttons (remove sm: padding, 44px → 48px)
- [ ] Fix card padding (remove sm: responsive)
- [ ] Fix section headers (remove sm: responsive)
- [ ] Fix icons (remove sm: responsive sizing)
- [ ] Fix large cards (rounded-3xl → rounded-2xl, p-8 → p-6)
- [ ] Standardize all card radii to rounded-2xl
- [ ] Test in Chrome
- [ ] Take screenshots for comparison

### Phase 3: Visual QA (15 min)

- [ ] Compare card border radius (should be 16px both platforms)
- [ ] Verify button heights (48px)
- [ ] Verify icon sizes (24px)
- [ ] Verify typography fixed (no responsive sizing)
- [ ] Verify padding consistent (24px cards)
- [ ] Document any acceptable platform differences

---

## 📏 Target Measurements

After alignment, both platforms should have:

| Element | Target Value |
|---------|--------------|
| **Card border radius** | 16px (lg) |
| **Card padding** | 24px |
| **Action button height** | 48px (md) |
| **Button border radius** | 12px (md) |
| **Toolbar button height** | 48px (md) |
| **Back button height** | 48px (md) |
| **Icon container** | 48x48px |
| **Icon size (main)** | 24px |
| **Page title** | 32px (text-3xl) |
| **Section headers** | 20px (text-xl) |
| **Body text** | 16px (text-base) |

---

## 🐛 Known Issues to Fix

### Mobile
1. ⚠️ Cards use RADIUS.xl (20px) - should use RADIUS.lg (16px) for consistency

### Web
1. ❌ Page title has responsive sizing (should be fixed 32px)
2. ❌ Subtitle has responsive sizing (should be fixed 16px)
3. ❌ Back button is 44px (should be 48px)
4. ❌ Toolbar buttons have responsive padding (should be fixed)
5. ❌ Toolbar buttons are 44px (should be 48px)
6. ❌ Card padding is responsive (should be fixed 24px)
7. ❌ Section headers have responsive sizing (should be fixed 20px)
8. ❌ Icons have responsive sizing (should be fixed 24px)
9. ❌ Some cards use rounded-3xl (24px) - should be rounded-2xl (16px)
10. ❌ Loading/error cards use rounded-3xl with p-8 (should be rounded-2xl p-6)

---

## 📝 Acceptable Platform Differences

These differences are intentional and should NOT be changed:

1. **Loading States:**
   - Mobile: Native ActivityIndicator component
   - Web: Custom loader in glass card
   - Both provide appropriate platform feedback ✅

2. **Error Handling:**
   - Mobile: Alert dialogs (native pattern)
   - Web: Inline error cards (web pattern)
   - Platform-appropriate patterns ✅

3. **Layout Container:**
   - Mobile: SafeAreaView (handles notches/status bar)
   - Web: Standard container div
   - Platform-appropriate wrappers ✅

4. **Navigation:**
   - Mobile: Native back button with navigation stack
   - Web: Link component with router navigation
   - Platform-appropriate navigation ✅

---

## 📝 Post-Implementation Verification

### Visual Checklist
- [ ] Cards have identical radius (16px)
- [ ] Cards have identical padding (24px)
- [ ] Buttons have identical height (48px)
- [ ] Icons have identical size (24px main)
- [ ] Typography fixed (no responsive sizing)
- [ ] No visual regressions

### Functionality Checklist
- [ ] Interview prep generation works
- [ ] Section expand/collapse works
- [ ] Navigation works (back button)
- [ ] Toolbar actions work (print, export, etc.)
- [ ] Interview date picker works
- [ ] Progress tracking displays correctly
- [ ] All expandable sections functional

---

**Last Updated:** February 22, 2026
**Status:** Ready for implementation
**Estimated Time:** 1 hour 30 minutes total
