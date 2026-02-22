# Design Standards - Shared Values
## Resume AI App - Mobile & Web

**Date:** February 22, 2026
**Purpose:** Enforce visual consistency across all platforms

---

## 🎨 Design Token Values

### Button Standards

**Heights (Touch-Friendly):**
```typescript
sm:  40px  // Small buttons, secondary actions
md:  48px  // Standard buttons (iOS touch target minimum: 44px)
lg:  56px  // Primary CTAs, hero sections
```

**Horizontal Padding:**
```typescript
sm:  16px  // Compact spacing
md:  24px  // Standard spacing
lg:  32px  // Generous spacing
```

**Border Radius:**
```typescript
buttons: 12px  // Balanced roundness (not too sharp, not too pill-like)
```

**Font Sizes:**
```typescript
sm:  14px  // Small buttons
md:  16px  // Standard buttons
lg:  18px  // Large buttons
```

**Font Weight:**
```typescript
all: 600 (Semibold)  // Clear, readable labels
```

---

### Card Standards

**Border Radius:**
```typescript
standard: 16px  // Glass cards, content containers
large:    20px  // Modal containers, hero cards
small:    12px  // Compact cards, chips
```

**Padding:**
```typescript
compact:  16px  // Dense information
standard: 24px  // Most cards
spacious: 32px  // Hero sections, modal content
```

**Glass Effect:**
```typescript
background: rgba(255, 255, 255, 0.12)  // Dark mode
background: rgba(0, 0, 0, 0.05)        // Light mode
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.15)  // Dark mode
border: 1px solid rgba(0, 0, 0, 0.08)        // Light mode
```

---

### Input Field Standards

**Heights:**
```typescript
standard: 48px  // All text inputs, selects, textareas (min)
```

**Horizontal Padding:**
```typescript
standard: 16px  // Input text padding
```

**Border Radius:**
```typescript
standard: 12px  // Slightly rounded, modern
```

**Border Width:**
```typescript
default:  1px solid rgba(255, 255, 255, 0.15)  // Dark
default:  1px solid rgba(0, 0, 0, 0.10)        // Light
focus:    2px solid #60A5FA                     // Blue accent
error:    2px solid #EF4444                     // Red error
```

**Font Size:**
```typescript
standard: 16px  // Prevents iOS zoom on focus
```

---

### Icon Sizes

**Standard Sizes:**
```typescript
xs:  16px  // Inline with small text, badges
sm:  20px  // Inline with body text
md:  24px  // Standard UI icons (buttons, cards)
lg:  28px  // Section headers, emphasis
xl:  32px  // Hero sections, primary actions
```

**Usage Guidelines:**
- Use `md (24px)` for all standard button icons
- Use `sm (20px)` for inline text icons
- Use `xl (32px)` for main CTAs and hero buttons
- Match icon size to its context (don't mix 20px and 24px icons in same row)

---

### Typography Scale

**Headings:**
```typescript
H1:  32px / 2rem    / text-3xl       (Page titles, hero headers)
H2:  24px / 1.5rem  / text-2xl       (Section headers)
H3:  20px / 1.25rem / text-xl        (Subsection headers)
H4:  18px / 1.125rem / text-lg       (Card titles)
```

**Body Text:**
```typescript
Body:    16px / 1rem     / text-base    (Standard text)
Small:   14px / 0.875rem / text-sm      (Secondary text, captions)
Caption: 12px / 0.75rem  / text-xs      (Tertiary text, timestamps)
```

**Font Weights:**
```typescript
Regular:  400  // Body text, descriptions
Medium:   500  // Subtle emphasis
Semibold: 600  // Buttons, labels, card titles
Bold:     700  // Headings, primary emphasis
```

**Line Heights:**
```typescript
Tight:   1.25  // Headings, compact text
Normal:  1.5   // Body text (readable)
Relaxed: 1.75  // Long-form content
```

---

### Spacing Scale

**Consistent Spacing:**
```typescript
xs:   4px   // Minimal gap (icon + text)
sm:   8px   // Tight spacing (button icon gap)
md:   16px  // Standard spacing (card padding, element gaps)
lg:   24px  // Section spacing (between cards)
xl:   32px  // Large spacing (page sections)
2xl:  48px  // Extra large (hero sections)
3xl:  64px  // Maximum (page margins)
```

**Usage Guidelines:**
- Use `md (16px)` for most element gaps
- Use `lg (24px)` for spacing between cards/sections
- Use `sm (8px)` for icon-to-text gaps
- Use `xs (4px)` only for very tight inline elements

---

### Color Palette

**Primary Colors:**
```typescript
Primary:    #60A5FA  // Blue (buttons, links, accents)
Secondary:  #8B5CF6  // Purple (secondary actions)
Accent:     #3B82F6  // Darker blue (hover states)
```

**Semantic Colors:**
```typescript
Success:    #10B981  // Green (success states, confirmations)
Error:      #EF4444  // Red (errors, destructive actions)
Warning:    #F59E0B  // Amber (warnings, cautions)
Info:       #06B6D4  // Cyan (informational messages)
```

**Text Colors (Dark Mode):**
```typescript
Primary:    #FFFFFF      // Main text
Secondary:  #9CA3AF      // Muted text, labels
Tertiary:   #6B7280      // Very muted text, timestamps
```

**Text Colors (Light Mode):**
```typescript
Primary:    #0A0A0A      // Main text (near black)
Secondary:  #4B5563      // Muted text
Tertiary:   #9CA3AF      // Very muted text
```

**Background Colors (Dark Mode):**
```typescript
Primary:    #0A0A0A      // Page background
Secondary:  #1A1A1A      // Card background
Tertiary:   #2A2A2A      // Elevated surfaces
```

**Background Colors (Light Mode):**
```typescript
Primary:    #FFFFFF      // Page background (pure white)
Secondary:  #F9FAFB      // Card background
Tertiary:   #F3F4F6      // Elevated surfaces
```

---

## 📱 Platform-Specific Implementation

### Mobile (React Native)

**Button Implementation:**
```typescript
// mobile/src/utils/constants.ts
export const BUTTON_SIZES = {
  sm: { height: 40, paddingHorizontal: 16, fontSize: 14, iconSize: 20 },
  md: { height: 48, paddingHorizontal: 24, fontSize: 16, iconSize: 24 },
  lg: { height: 56, paddingHorizontal: 32, fontSize: 18, iconSize: 28 },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const INPUT_HEIGHT = 48;
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
};
```

**Usage in Components:**
```tsx
<GlassButton
  variant="primary"
  size="md"  // 48px height, 24px padding, 16px font
  icon={<FileText size={24} />}  // md icon size
>
  Upload Resume
</GlassButton>

<GlassCard style={{ padding: 24, borderRadius: 16 }}>
  {/* Card content */}
</GlassCard>

<TextInput
  style={{ height: 48, paddingHorizontal: 16, borderRadius: 12 }}
  placeholder="Enter text"
/>
```

---

### Web (React + Tailwind)

**Button Implementation:**
```css
/* web/src/index.css */
.btn-sm {
  min-height: 40px;
  padding: 10px 16px;
  font-size: 14px;
  border-radius: 12px;
}

.btn-md {
  min-height: 48px;
  padding: 14px 24px;
  font-size: 16px;
  border-radius: 12px;
}

.btn-lg {
  min-height: 56px;
  padding: 18px 32px;
  font-size: 18px;
  border-radius: 12px;
}

.card {
  border-radius: 16px;
  padding: 24px;
}

.card-lg {
  border-radius: 20px;
  padding: 32px;
}

.input-field {
  min-height: 48px;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 16px;  /* Prevents iOS zoom */
}
```

**Usage in Components:**
```tsx
<button className="btn-md btn-primary">
  <FileText size={24} />
  Upload Resume
</button>

<div className="card glass">
  {/* Card content */}
</div>

<input
  className="input-field"
  placeholder="Enter text"
/>
```

---

## ✅ Migration Checklist

### Phase 1: Update Constants (30 min)

**Mobile:**
- [ ] Update `BUTTON_SIZES` in `mobile/src/utils/constants.ts`
  - Change `md` height from `44` to `48`
  - Change `sm` height from `36` to `40`
  - Change `lg` height from `52` to `56`
  - Update padding values to match standards
- [ ] Update `RADIUS` values
  - Add button-specific radius: `button: 12`
  - Update card radius: `card: 16`, `cardLarge: 20`
- [ ] Add `INPUT_HEIGHT = 48` constant
- [ ] Update `ICON_SIZES` to match standard scale

**Web:**
- [ ] Update button classes in `web/src/index.css`
  - Change border-radius from `8px` to `12px`
  - Ensure min-height values match: `40px`, `48px`, `56px`
  - Update padding values to match standards
- [ ] Add input field utility classes
- [ ] Add card size utility classes
- [ ] Document icon size usage in comments

---

### Phase 2: Update Components (2-3 hours)

**Mobile Components:**
- [ ] Update `GlassButton.tsx` to use new size constants
- [ ] Update `GlassCard.tsx` to use new radius constants
- [ ] Create `GlassInput.tsx` component with standardized styling
- [ ] Update all icon sizes in existing screens

**Web Components:**
- [ ] Update all `<button>` elements to use new classes
- [ ] Update all card `className` to use standardized radius
- [ ] Update all `<input>` elements to use new classes
- [ ] Audit icon sizes across all pages

---

### Phase 3: Visual QA (1 day)

- [ ] Screenshot mobile app (all screens)
- [ ] Screenshot web app (all pages)
- [ ] Side-by-side comparison
- [ ] Measure actual pixel values with dev tools
- [ ] Fix any discrepancies
- [ ] Document approved designs

---

## 🎯 Success Criteria

### Buttons
✅ All primary buttons are 48px tall
✅ All buttons have 12px border radius
✅ All button icons are 24px (md size)
✅ All button labels are 16px, weight 600
✅ Button hover/press states match

### Cards
✅ All cards have 16px border radius (standard) or 20px (large)
✅ All cards have 24px padding (standard)
✅ Glass effect opacity is consistent (0.12 dark, 0.05 light)
✅ Border color matches (rgba values identical)

### Inputs
✅ All inputs are 48px tall
✅ All inputs have 12px border radius
✅ All inputs have 16px horizontal padding
✅ All inputs use 16px font size (prevents iOS zoom)
✅ Focus states match (2px blue border)

### Icons
✅ Standard UI icons are 24px
✅ Small inline icons are 20px
✅ Large hero icons are 32px
✅ Icons are vertically centered with text

### Typography
✅ H1 is 32px across both platforms
✅ H2 is 24px across both platforms
✅ Body text is 16px across both platforms
✅ Font weights match (400, 500, 600, 700)

### Spacing
✅ Card gaps are 24px
✅ Section gaps are 32px
✅ Element gaps are 16px
✅ Icon-text gaps are 8px

---

## 📐 Design Measurement Guide

### How to Verify Consistency

**Mobile (iOS Simulator):**
1. Open Xcode Simulator
2. Use "Debug > View Hierarchy" to inspect elements
3. Measure heights, padding, border radius
4. Compare to standard values

**Web (Chrome DevTools):**
1. Right-click element > "Inspect"
2. Check "Computed" tab for actual rendered values
3. Verify:
   - `height` matches min-height standard
   - `padding-left/right` matches standard
   - `border-radius` matches standard
4. Use "Select Element" tool to measure gaps between elements

**Screenshot Comparison:**
1. Take screenshot of mobile screen at 100% zoom
2. Take screenshot of web page at same effective zoom
3. Overlay in Figma or Photoshop
4. Measure button heights, card spacing, icon sizes
5. Flag any differences >2px

---

## 🔄 Ongoing Maintenance

### Before Merging Any PR:

**Checklist:**
- [ ] New buttons use standardized height/padding/radius
- [ ] New cards use standardized radius/padding
- [ ] New inputs use standardized height/padding
- [ ] New icons use standard sizes (20px/24px/28px)
- [ ] No hardcoded color values (use design tokens)
- [ ] No hardcoded spacing values (use spacing scale)

### Monthly Design Audit:

- Review all screens for consistency
- Update this document with any new standards
- Fix any drift from standards
- Update screenshots in design reference

---

## 📚 Resources

- **Figma Design System:** [Link when created]
- **Mobile Constants:** `mobile/src/utils/constants.ts`
- **Web Styles:** `web/src/index.css`
- **Component Library:** See individual component files
- **Visual Reference:** `VISUAL_DESIGN_REFERENCE.md` (when created)

---

**Last Updated:** February 22, 2026
**Maintained By:** Development Team
**Questions?** Check Slack #design-system channel
