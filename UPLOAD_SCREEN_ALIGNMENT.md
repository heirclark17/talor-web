# Upload Screen Visual Alignment
## Mobile vs Web Comparison & Action Plan

**Date:** February 22, 2026
**Screen:** Upload Resume
**Priority:** HIGH (Core user flow)

---

## 📊 Current State Comparison

### Layout Structure

| Element | Mobile | Web | Match? |
|---------|--------|-----|--------|
| **Header** | Close button + "Upload Resume" + placeholder | Title only | ❌ Different structure |
| **Upload Area** | GlassCard with 3 states (drop zone, preview, success) | Glass div with 3 states | ⚠️ Different styling |
| **Info Section** | ✅ "What happens next?" with 3 steps | ❌ None | ❌ Missing on web |
| **Parsed Display** | ❌ None | ✅ Full parsed resume cards | ❌ Mobile missing feature |
| **Upload Button** | Footer button (lg size) | Inside drop zone | ⚠️ Different placement |

---

## 🎯 Visual Consistency Issues

### Issue 1: Upload Area Card Styling

**Mobile:**
```tsx
<GlassCard
  borderRadius={SPACING.radiusMD}  // 12px
  padding={SPACING.xl}              // 32px
>
```

**Web:**
```tsx
<div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16">
  // 16px/24px radius (responsive)
  // 24px/40px/64px padding (responsive)
</div>
```

**Target:**
- Border radius: 16px (RADIUS.lg) - larger cards use lg
- Padding: 32px (consistent, no responsive)

---

### Issue 2: Icon Sizes (Responsive vs Fixed)

**Mobile:**
```tsx
<Upload size={48} />       // Drop zone icon
<FileText size={48} />     // File preview icon
<CheckCircle size={64} />  // Success icon
```

**Web:**
```tsx
<Upload className="w-12 h-12 sm:w-16 sm:h-16" />       // 48px/64px
<FileText className="w-8 h-8" />                       // 32px (parsed display)
<CheckCircle className="w-12 h-12 sm:w-16 sm:h-16" />  // 48px/64px
```

**Target:**
- Drop zone icon: 48px (md size, no responsive)
- File preview icon: 48px
- Success icon: 64px
- Parsed display icon: 32px

---

### Issue 3: Typography Responsive Sizing

**Mobile:** Fixed sizes using TYPOGRAPHY constants
- Title: TYPOGRAPHY.title3 (20px, weight 600)
- Body: TYPOGRAPHY.subhead (14px, weight 400)
- Caption: TYPOGRAPHY.caption1 (12px, weight 400)

**Web:** Responsive sizing
- Title: `text-3xl sm:text-4xl lg:text-6xl` (30px/36px/60px)
- Subtitle: `text-base sm:text-lg lg:text-xl` (16px/18px/20px)
- Drop zone text: `text-base sm:text-lg` (16px/18px)

**Target:** Use fixed sizes matching mobile
- Page title: 32px (h1)
- Subtitle: 16px (body)
- Section titles: 20px (h3)
- Body text: 14px (subhead)
- Captions: 12px

---

### Issue 4: Missing Info Section on Web

**Mobile has:**
```tsx
<GlassCard>
  <Text>What happens next?</Text>

  <View> {/* Step 1 */}
    <NumberBadge>1</NumberBadge>
    <Text>We'll extract your experience, skills, and education</Text>
  </View>

  <View> {/* Step 2 */}
    <NumberBadge>2</NumberBadge>
    <Text>Use AI to tailor your resume for specific job postings</Text>
  </View>

  <View> {/* Step 3 */}
    <NumberBadge>3</NumberBadge>
    <Text>Get interview prep materials based on your tailored resume</Text>
  </View>
</GlassCard>
```

**Web:** Missing entirely - should add before or after upload area

---

### Issue 5: Button Styling

**Mobile:**
```tsx
<GlassButton
  variant="primary"
  size="lg"              // 56px height
  icon={<Upload size={20} />}
/>
```

**Web:**
```tsx
<button className="btn-primary">
  // Should be 48px standard height
  Select File
</button>
```

**Target:** Both should use 48px standard button height (not lg)

---

## 🔧 Required Changes

### Mobile Changes

**File:** `mobile/src/screens/UploadResumeScreen.tsx`

1. **Update upload area border radius**
   ```tsx
   // BEFORE
   borderRadius={SPACING.radiusMD}  // 12px

   // AFTER
   borderRadius={SPACING.radiusLG}  // 16px (larger card)
   ```

2. **Change upload button from lg to md**
   ```tsx
   // BEFORE
   size="lg"  // 56px

   // AFTER
   size="md"  // 48px (standard)
   ```

3. **Update icon size in button**
   ```tsx
   // BEFORE
   icon={<Upload color="#ffffff" size={20} />}

   // AFTER
   icon={<Upload color="#ffffff" size={24} />}  // md button icon size
   ```

**Estimated Changes:** 3 lines

---

### Web Changes

**File:** `web/src/pages/UploadResume.tsx`

1. **Simplify upload area border radius**
   ```tsx
   // BEFORE
   className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16"

   // AFTER
   className="glass rounded-2xl p-8"  // 16px radius, 32px padding
   ```

2. **Fix icon sizes to be non-responsive**
   ```tsx
   // BEFORE
   <Upload className="w-12 h-12 sm:w-16 sm:h-16" />

   // AFTER
   <Upload className="w-12 h-12" />  // Always 48px

   // BEFORE
   <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16" />

   // AFTER
   <CheckCircle className="w-16 h-16" />  // Always 64px for success
   ```

3. **Simplify page title typography**
   ```tsx
   // BEFORE
   <h1 className="text-3xl sm:text-4xl lg:text-6xl">Upload Resume</h1>

   // AFTER
   <h1 className="text-3xl">Upload Resume</h1>  // Always 32px
   ```

4. **Simplify subtitle typography**
   ```tsx
   // BEFORE
   <p className="text-base sm:text-lg lg:text-xl">Upload a new resume...</p>

   // AFTER
   <p className="text-base">Upload a new resume...</p>  // Always 16px
   ```

5. **Fix drop zone text sizing**
   ```tsx
   // BEFORE
   <p className="text-base sm:text-lg">Click to select your resume</p>

   // AFTER
   <p className="text-base">Click to select your resume</p>  // Always 16px

   // BEFORE
   <p className="text-xs sm:text-sm">Supports .docx and .pdf files...</p>

   // AFTER
   <p className="text-sm">Supports .docx and .pdf files...</p>  // Always 14px
   ```

6. **Add "What happens next?" info section**
   ```tsx
   {/* Add after upload area, before parsed resume display */}
   <div className="glass rounded-2xl p-6 mb-12">
     <h3 className="text-xl font-semibold text-theme mb-6">What happens next?</h3>

     <div className="space-y-4">
       <div className="flex items-start gap-4">
         <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
           <span className="text-white text-sm font-semibold">1</span>
         </div>
         <p className="text-theme-secondary">
           We'll extract your experience, skills, and education
         </p>
       </div>

       <div className="flex items-start gap-4">
         <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
           <span className="text-white text-sm font-semibold">2</span>
         </div>
         <p className="text-theme-secondary">
           Use AI to tailor your resume for specific job postings
         </p>
       </div>

       <div className="flex items-start gap-4">
         <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
           <span className="text-white text-sm font-semibold">3</span>
         </div>
         <p className="text-theme-secondary">
           Get interview prep materials based on your tailored resume
         </p>
       </div>
     </div>
   </div>
   ```

**Estimated Changes:** 25-30 lines

---

## ✅ Implementation Checklist

### Phase 1: Mobile Fixes (10 min)

- [ ] Update upload area: `borderRadius={SPACING.radiusLG}`
- [ ] Update upload button: `size="md"` instead of `size="lg"`
- [ ] Update button icon: `size={24}` instead of `size={20}`
- [ ] Test on iOS simulator
- [ ] Take screenshot for comparison

### Phase 2: Web Fixes (40 min)

- [ ] Simplify upload area: remove responsive padding/radius
- [ ] Fix Upload icon: remove responsive sizing (always 48px)
- [ ] Fix CheckCircle icon: always 64px
- [ ] Simplify page title: remove responsive sizing
- [ ] Simplify subtitle: remove responsive sizing
- [ ] Fix drop zone text: remove responsive sizing
- [ ] Add "What happens next?" section with 3 steps
- [ ] Test in Chrome
- [ ] Take screenshot for comparison

### Phase 3: Visual QA (15 min)

- [ ] Compare screenshots side-by-side
- [ ] Measure card border radius (should be 16px)
- [ ] Measure card padding (should be 32px)
- [ ] Measure icon sizes (48px drop zone, 64px success)
- [ ] Verify typography matches (32px/16px/14px)
- [ ] Verify info section present on both
- [ ] Document remaining differences (parsed display only on web)

---

## 📏 Target Measurements

After alignment, both platforms should have:

| Element | Target Value |
|---------|--------------|
| **Upload area radius** | 16px (lg) |
| **Upload area padding** | 32px |
| **Drop zone icon** | 48px |
| **Success icon** | 64px |
| **Upload button height** | 48px (md size) |
| **Button icon size** | 24px |
| **Page title** | 32px |
| **Subtitle** | 16px |
| **Section titles** | 20px |
| **Body text** | 14px |
| **Info section** | Present on both |

---

## 🐛 Known Issues to Fix

### Mobile
1. ⚠️ Upload area uses 12px radius (should be 16px for large cards)
2. ⚠️ Upload button uses lg size (should be md/48px standard)
3. ⚠️ Button icon is 20px (should be 24px for md button)

### Web
1. ❌ Upload area has responsive radius (should be fixed 16px)
2. ❌ Upload area has responsive padding (should be fixed 32px)
3. ❌ Icons have responsive sizing (should be fixed 48px/64px)
4. ❌ Typography has responsive sizing (should be fixed)
5. ❌ Missing "What happens next?" info section
6. ✅ Parsed resume display is web-only feature (acceptable difference)

---

## 📝 Post-Implementation Verification

### Visual Checklist
- [ ] Upload area looks identical in size and shape
- [ ] Icons are same size (48px drop zone, 64px success)
- [ ] Typography sizes match (32px/16px/14px)
- [ ] Padding matches (32px)
- [ ] Border radius matches (16px)
- [ ] Info section present on both platforms
- [ ] Button height matches (48px)

### Functionality Checklist
- [ ] File selection works
- [ ] Upload works
- [ ] Success state displays correctly
- [ ] Error state displays correctly
- [ ] Navigation works (back button mobile, navigation web)

---

**Last Updated:** February 22, 2026
**Status:** Ready for implementation
**Estimated Time:** 1 hour total

