# Tailor Resume Screen Visual Alignment
## Mobile vs Web Comparison & Action Plan

**Date:** February 22, 2026
**Screen:** Tailor Resume
**Priority:** HIGH (Core feature)

---

## 📊 Current State Comparison

### Layout Structure

| Element | Mobile | Web | Match? |
|---------|--------|-----|--------|
| **Header** | SafeAreaView with title | Page header with title | ⚠️ Different structure |
| **Job URL Input** | 48px input + 48px icon button | Responsive input + button | ⚠️ Different sizing |
| **Manual Entry Inputs** | Company + Job Title (48px each) | Company + Job Title (responsive) | ⚠️ Different sizing |
| **Extract Button** | 48x48px square icon button | Full button with text | ❌ Different design |
| **Input Icons** | 20px | Responsive 16-20px | ⚠️ Different sizing |
| **Tailor Button** | Footer GlassButton | Large button (56px min-h) | ⚠️ Different heights |
| **Comparison View** | ✅ Side-by-side cards | ✅ Side-by-side cards | ✅ Similar |
| **Border Radius** | 12px (md) throughout | Responsive (12-16-20px) | ❌ Different |

---

## 🎯 Visual Consistency Issues

### Issue 1: Input Field Sizing (Mobile vs Web)

**Mobile:**
```tsx
inputWrapper: {
  flex: 1,
  borderRadius: RADIUS.md,  // 12px
  borderWidth: 1,
  minHeight: 48,
}
input: {
  flex: 1,
  fontSize: 16,
  padding: SPACING.md,  // 16px
}
```

**Web:**
```tsx
className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-theme-glass-5 border-2 rounded-xl
          text-[16px] sm:text-lg min-h-[48px]"
// Responsive padding: 16px/20px horizontal, 12px/16px vertical
// Responsive text: 16px → 18px
// Border radius: 12px (rounded-xl)
```

**Target:**
- Border radius: 12px (md) - MATCHES ✅
- Min height: 48px - MATCHES ✅
- Padding: Fixed 16px horizontal, 12px vertical (no responsive)
- Font size: Fixed 16px (no responsive)
- Remove `sm:` responsive classes

---

### Issue 2: Button Icon Sizes

**Mobile:**
```tsx
// Extract button icon
<Sparkles color="#fff" size={20} />

// Tailor button icon
<Target color="#fff" size={20} />

// Input field icons
<Link size={20} />
<Building2 size={20} />
<Target size={20} />
```

**Web:**
```tsx
// Extract button
<Loader2 className="w-5 h-5" />  // 20px ✅

// Tailor button
<Sparkles className="w-6 h-6" />  // 24px ❌ (should be 20px)

// Various icons
<Sparkles className="w-4 h-4" />  // 16px (hint text)
<CheckCircle2 className="w-5 h-5" />  // 20px
<Bookmark className="w-4 h-4" />  // 16px
```

**Target:**
- Main button icons: 20px (not 24px)
- Input field icons: 20px
- Small/hint icons: 16px
- Remove responsive sizing (w-6 sm:w-8)

---

### Issue 3: Extract Button Design Difference

**Mobile:**
```tsx
extractButton: {
  width: 48,
  height: 48,
  paddingHorizontal: 0,
}
// Square icon-only button
```

**Web:**
```tsx
<button className="px-5 sm:px-6 py-3 sm:py-4 rounded-xl min-h-[48px]">
  {extracting ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      Extracting...
    </span>
  ) : (
    'Extract Details'
  )}
</button>
// Full button with text
```

**Decision:** Keep designs different (acceptable platform difference)
- Mobile: Icon-only to save space on narrow screens
- Web: Full text button for clarity on wide screens
- Both are 48px height (aligned) ✅

---

### Issue 4: Tailor Button Height

**Mobile:**
```tsx
footer: {
  padding: SPACING.lg,  // 24px
}
<GlassButton
  label="Tailor Resume"
  variant="primary"
  fullWidth
  // Uses default GlassButton size (need to check if md or lg)
/>
```

**Web:**
```tsx
<button className="w-full py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl min-h-[56px]">
  // Responsive padding: 16px → 24px
  // Responsive text: 18px → 20px
  // Min height: 56px (lg size)
</button>
```

**Target:**
- Mobile: Explicitly set `size="lg"` on GlassButton (56px)
- Web: Remove responsive padding/text (py-6, text-xl fixed)
- Both use 56px for this primary CTA ✅

---

### Issue 5: Border Radius Responsive Sizing

**Mobile:** Fixed 12px (RADIUS.md) throughout
```tsx
inputWrapper: { borderRadius: RADIUS.md }  // 12px
comparisonCard: { borderRadius: RADIUS.md }  // 12px
```

**Web:** Responsive radius
```tsx
rounded-xl        // 12px base
sm:rounded-2xl    // 16px on tablet+
rounded-2xl       // 16px
```

**Target:** Web should use fixed sizes only
- Form inputs/cards: `rounded-xl` (12px) - remove responsive
- No `sm:rounded-2xl` or other responsive radius

---

### Issue 6: Text/Icon Responsive Sizing on Web

**Web uses many responsive classes:**
```tsx
text-2xl sm:text-3xl lg:text-4xl  // Page title
text-sm sm:text-base              // Body text
text-xs sm:text-sm                // Caption text
w-6 h-6 sm:w-8 sm:h-8            // Header icon
w-4 h-4                          // Small icons
w-5 h-5                          // Medium icons
w-6 h-6                          // Large button icons
px-4 sm:px-6                     // Button padding
py-3 sm:py-4                     // Input padding
```

**Target:** Remove all responsive sizing
- Page title: `text-3xl` (32px fixed)
- Body text: `text-sm` (14px fixed) or `text-base` (16px fixed)
- Caption: `text-xs` (12px fixed)
- Icons: Fixed sizes (w-4, w-5, w-6 without sm: variants)
- Padding: Fixed values (no sm: variants)

---

## 🔧 Required Changes

### Mobile Changes

**File:** `mobile/src/screens/TailorResumeScreen.tsx`

1. **Explicitly set Tailor button size to lg**
   ```tsx
   // Line ~953
   <GlassButton
     label="Tailor Resume"
     variant="primary"
     size="lg"  // ADD THIS - explicitly use 56px height
     fullWidth
     // ... rest of props
   />
   ```

**Estimated Changes:** 1 line

---

### Web Changes

**File:** `web/src/pages/TailorResume.tsx`

1. **Remove responsive padding from inputs**
   ```tsx
   // BEFORE (lines ~2935, 2960)
   className="px-4 sm:px-5 py-3 sm:py-4"

   // AFTER
   className="px-4 py-3"  // Fixed 16px horizontal, 12px vertical
   ```

2. **Remove responsive text sizing from inputs**
   ```tsx
   // BEFORE
   text-[16px] sm:text-lg

   // AFTER
   text-base  // Fixed 16px
   ```

3. **Fix Extract button responsive sizing**
   ```tsx
   // BEFORE (line ~2900)
   className="px-5 sm:px-6 py-3 sm:py-4 rounded-xl"

   // AFTER
   className="px-5 py-3 rounded-xl"  // Fixed padding
   ```

4. **Fix Tailor button to lg size (no responsive)**
   ```tsx
   // BEFORE (line ~2078, 3078)
   className="py-4 sm:py-6 rounded-2xl text-lg sm:text-xl min-h-[56px]"

   // AFTER
   className="py-6 rounded-2xl text-xl min-h-[56px]"  // Fixed lg size
   ```

5. **Fix Tailor button icon from 24px to 20px**
   ```tsx
   // BEFORE (line ~2091, 3091)
   <Sparkles className="w-6 h-6" />

   // AFTER
   <Sparkles className="w-5 h-5" />  // 20px matches mobile
   ```

6. **Remove responsive from page title**
   ```tsx
   // BEFORE (line ~1327)
   className="text-2xl sm:text-3xl lg:text-4xl"

   // AFTER
   className="text-3xl"  // Fixed 32px
   ```

7. **Remove responsive from header icon**
   ```tsx
   // BEFORE (line ~1324)
   <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />

   // AFTER
   <Sparkles className="w-6 h-6" />  // Fixed 24px
   ```

8. **Remove responsive from toolbar buttons**
   ```tsx
   // BEFORE (line ~1364, 1375, 1392, etc.)
   className="px-3 sm:px-4 py-2 min-h-[44px]"

   // AFTER
   className="px-4 py-2 min-h-[44px]"  // Fixed padding
   ```

9. **Remove responsive from button text**
   ```tsx
   // BEFORE (multiple locations)
   <span className="text-sm font-medium hidden sm:inline">Sync Scroll</span>

   // AFTER
   <span className="text-sm font-medium">Sync Scroll</span>  // Always show
   ```

10. **Simplify comparison card border radius**
    ```tsx
    // Search for rounded-xl sm:rounded-2xl patterns
    // Change to single fixed value: rounded-xl (12px)
    ```

**Estimated Changes:** 30-40 lines across multiple sections

---

## ✅ Implementation Checklist

### Phase 1: Mobile Fixes (5 min)

- [ ] Add `size="lg"` to Tailor button in TailorResumeScreen
- [ ] Test on iOS simulator
- [ ] Verify button height is 56px
- [ ] Take screenshot for comparison

### Phase 2: Web Fixes (60 min)

- [ ] Remove responsive padding from inputs (4 locations)
- [ ] Remove responsive text sizing from inputs
- [ ] Fix Extract button padding (remove sm:)
- [ ] Fix Tailor button padding/text (remove sm:)
- [ ] Fix Tailor button icon (24px → 20px)
- [ ] Fix page title (remove responsive sizing)
- [ ] Fix header icon (remove responsive sizing)
- [ ] Fix toolbar buttons (remove sm: padding)
- [ ] Remove hidden sm:inline from button text
- [ ] Simplify border radius (remove sm: variants)
- [ ] Test in Chrome
- [ ] Take screenshots for comparison

### Phase 3: Visual QA (15 min)

- [ ] Compare input heights (should be 48px)
- [ ] Compare Tailor button heights (should be 56px)
- [ ] Verify icon sizes (20px main, 16px small)
- [ ] Verify border radius (12px cards/inputs)
- [ ] Verify no responsive sizing artifacts
- [ ] Check text sizes match (16px inputs, 14px hints)
- [ ] Document acceptable differences (Extract button design)

---

## 📏 Target Measurements

After alignment, both platforms should have:

| Element | Target Value |
|---------|--------------|
| **Input height** | 48px (md) |
| **Input border radius** | 12px (md) |
| **Input padding** | 16px horizontal, 12px vertical |
| **Input text size** | 16px |
| **Input icons** | 20px |
| **Extract button height** | 48px |
| **Tailor button height** | 56px (lg size) |
| **Tailor button icon** | 20px |
| **Page title** | 32px (text-3xl) |
| **Card border radius** | 12px (rounded-xl) |
| **Toolbar button height** | 44px |

---

## 🐛 Known Issues to Fix

### Mobile
1. ⚠️ Tailor button doesn't explicitly set size (should be `size="lg"`)

### Web
1. ❌ Input fields have responsive padding (should be fixed)
2. ❌ Input fields have responsive text sizing (should be fixed 16px)
3. ❌ Extract button has responsive padding
4. ❌ Tailor button has responsive padding/text
5. ❌ Tailor button icon is 24px (should be 20px)
6. ❌ Page title has responsive sizing (should be fixed 32px)
7. ❌ Header icon has responsive sizing (should be fixed 24px)
8. ❌ Toolbar buttons have responsive padding
9. ❌ Toolbar button text hidden on small screens
10. ❌ Border radius has responsive sizing

---

## 📝 Acceptable Platform Differences

These differences are intentional and should NOT be changed:

1. **Extract Button Design:**
   - Mobile: 48x48px icon-only button (space-saving for narrow screens)
   - Web: Full button with "Extract Details" text (clarity on wide screens)
   - Both are 48px height ✅

2. **Layout Structure:**
   - Mobile: SafeAreaView native wrapper
   - Web: Standard div container
   - Platform-appropriate patterns ✅

3. **Comparison View Implementation:**
   - Mobile: GlassCard with native BlurView
   - Web: div with backdrop-filter CSS
   - Visual result identical ✅

---

## 📝 Post-Implementation Verification

### Visual Checklist
- [ ] Input fields identical height (48px)
- [ ] Tailor button identical height (56px)
- [ ] Icons same size (20px main, 16px small)
- [ ] Typography fixed (no responsive sizing)
- [ ] Padding fixed (no sm: variants)
- [ ] Border radius consistent (12px)

### Functionality Checklist
- [ ] Extract job details works
- [ ] Manual entry works
- [ ] Tailor resume generation works
- [ ] Comparison view displays correctly
- [ ] All buttons clickable/accessible
- [ ] No visual regressions

---

**Last Updated:** February 22, 2026
**Status:** Ready for implementation
**Estimated Time:** 1 hour 20 minutes total
