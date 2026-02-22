# Visual Design Reference
## Resume AI App - Mobile vs Web Screenshot Comparison

**Date:** February 22, 2026
**Purpose:** Visual QA and design consistency verification

---

## 📸 How to Generate Reference Screenshots

### Mobile (iOS Simulator / Android Emulator)

**iOS Simulator:**
1. Open project in Xcode or run `npx expo start` → press `i`
2. Wait for app to fully load
3. Navigate to each screen
4. Press `Cmd + S` to save screenshot
5. Screenshots saved to: `~/Desktop/` (by default)
6. Rename to: `mobile-[screen-name].png`

**Android Emulator:**
1. Run `npx expo start` → press `a`
2. Navigate to each screen
3. Click camera icon in emulator toolbar OR press `Ctrl + S`
4. Screenshots saved to: Emulator gallery
5. Drag to desktop and rename to: `mobile-[screen-name].png`

**Using Expo Go on Real Device:**
1. Shake device → "Screenshot"
2. Save to Photos
3. AirDrop/email to computer
4. Rename consistently

---

### Web (Chrome DevTools)

**Full Page Screenshots:**
1. Open `http://localhost:5173` in Chrome
2. Right-click → "Inspect" (or press `F12`)
3. Press `Ctrl + Shift + P` (Windows) or `Cmd + Shift + P` (Mac)
4. Type "screenshot" → Select "Capture full size screenshot"
5. Screenshot downloads to `~/Downloads/`
6. Rename to: `web-[screen-name].png`

**Mobile Viewport Screenshots (for comparison):**
1. Open DevTools (`F12`)
2. Click "Toggle device toolbar" icon (or `Ctrl + Shift + M`)
3. Select device: "iPhone 14 Pro" or "Pixel 7"
4. Capture screenshot (same method as above)
5. Rename to: `web-mobile-[screen-name].png`

---

## 📋 Required Screenshots

### Core User Flows (High Priority)

| Screen Name | Mobile File | Web File | Notes |
|-------------|-------------|----------|-------|
| Home (Resume List) | `mobile-home.png` | `web-home.png` | Compare card layouts, spacing |
| Upload Resume | `mobile-upload.png` | `web-upload.png` | Compare button styles, dropzone |
| Tailor Resume | `mobile-tailor.png` | `web-tailor.png` | Compare form inputs, buttons |
| Interview Prep Detail | `mobile-interview-prep.png` | `web-interview-prep.png` | Compare tabs, content cards |
| Sign In | `mobile-signin.png` | `web-signin.png` | Compare input fields, buttons |

### Secondary Screens (Medium Priority)

| Screen Name | Mobile File | Web File | Notes |
|-------------|-------------|----------|-------|
| Batch Tailor | `mobile-batch-tailor.png` | `web-batch-tailor.png` | Compare grid layouts |
| Cover Letter Generator | `mobile-cover-letter.png` | `web-cover-letter.png` | Compare editor UI |
| Application Tracker | `mobile-applications.png` | `web-applications.png` | Compare table/list views |
| STAR Stories | `mobile-star-stories.png` | `web-star-stories.png` | Compare builder UI |
| Career Path Designer | `mobile-career-path.png` | `web-career-path.png` | Compare wizard steps |
| Saved Comparisons | `mobile-saved.png` | `web-saved.png` | Compare list layouts |
| Job Search | `mobile-job-search.png` | `web-job-search.png` | Compare search UI |

### Settings & Static (Low Priority)

| Screen Name | Mobile File | Web File | Notes |
|-------------|-------------|----------|-------|
| Settings | `mobile-settings.png` | `web-settings.png` | Should be near-identical |
| Pricing | `mobile-pricing.png` | `web-pricing.png` | Should be near-identical |
| Privacy Policy | `mobile-privacy.png` | `web-privacy.png` | Should be near-identical |
| Terms of Service | `mobile-terms.png` | `web-terms.png` | Should be near-identical |

---

## 🔍 Visual QA Checklist

For each screen pair, verify:

### Layout Consistency

- [ ] **Visual Hierarchy Match**
  - Headers same prominence
  - Content sections in same order
  - Call-to-action placement consistent

- [ ] **Spacing Match**
  - Card gaps: 24px between cards
  - Section gaps: 32px between sections
  - Element gaps: 16px between related elements
  - Margins: 16-24px from screen edges

- [ ] **Alignment**
  - Text left-aligned (body content)
  - Buttons center-aligned in containers
  - Icons vertically centered with text

---

### Component Styling

#### Buttons

- [ ] **Height**
  - Primary/Secondary: 48px (measure in DevTools)
  - Small: 40px
  - Large: 56px

- [ ] **Border Radius**
  - All buttons: 12px (measure computed border-radius)

- [ ] **Padding**
  - Standard: 14px vertical, 24px horizontal
  - Small: 10px vertical, 16px horizontal
  - Large: 18px vertical, 32px horizontal

- [ ] **Typography**
  - Font size: 16px (standard), 14px (sm), 18px (lg)
  - Font weight: 600 (semibold)
  - Font family: Urbanist

- [ ] **Colors**
  - Primary: #60A5FA background (or inverted on mobile)
  - Secondary: Glass background with border
  - Danger: rgba(239, 68, 68, 0.15) background

- [ ] **Icons**
  - Size: 24px for standard buttons
  - Gap from text: 8px

---

#### Cards

- [ ] **Border Radius**
  - Standard cards: 16px
  - Large cards (modals): 20px
  - Small cards (chips): 12px

- [ ] **Padding**
  - Standard: 24px all sides
  - Compact: 16px all sides
  - Spacious: 32px all sides

- [ ] **Glass Effect**
  - Background: rgba(255, 255, 255, 0.12) dark mode
  - Background: rgba(0, 0, 0, 0.05) light mode
  - Backdrop blur: 12px
  - Border: 1px solid rgba(255, 255, 255, 0.15) dark
  - Border: 1px solid rgba(0, 0, 0, 0.08) light

- [ ] **Shadow** (Web only)
  - Subtle shadow on hover (mobile uses press animation)

---

#### Input Fields

- [ ] **Height**
  - All inputs: 48px minimum

- [ ] **Border Radius**
  - All inputs: 12px

- [ ] **Padding**
  - Horizontal: 16px

- [ ] **Font**
  - Size: 16px (prevents iOS zoom)
  - Weight: 400 (regular)
  - Family: Urbanist

- [ ] **States**
  - Default: 1px border, subtle color
  - Focus: 2px border, #60A5FA (blue)
  - Error: 2px border, #EF4444 (red)
  - Disabled: 50% opacity

---

#### Icons

- [ ] **Sizes**
  - Standard UI: 24px (most common)
  - Inline text: 20px
  - Small badges: 16px
  - Hero sections: 32px

- [ ] **Colors**
  - Primary actions: #60A5FA
  - Secondary: --text-secondary (#9CA3AF dark, #4B5563 light)
  - Success: #10B981
  - Error: #EF4444
  - Warning: #F59E0B

- [ ] **Alignment**
  - Vertically centered with adjacent text
  - Consistent gap (8px from text)

---

### Typography

- [ ] **Headings**
  - H1: 32px, weight 700
  - H2: 24px, weight 600
  - H3: 20px, weight 600
  - H4: 18px, weight 600

- [ ] **Body**
  - Standard: 16px, weight 400, line-height 1.5
  - Small: 14px, weight 400
  - Caption: 12px, weight 400

- [ ] **Font Family**
  - All text: Urbanist (verify in DevTools)

- [ ] **Colors**
  - Primary text: #FFFFFF (dark) / #0A0A0A (light)
  - Secondary: #9CA3AF (dark) / #4B5563 (light)
  - Tertiary: #6B7280

---

### Color Consistency

- [ ] **Accent Colors Match**
  - Primary: #60A5FA
  - Secondary: #8B5CF6
  - Verify in DevTools computed styles

- [ ] **Semantic Colors Match**
  - Success: #10B981
  - Error: #EF4444
  - Warning: #F59E0B
  - Info: #06B6D4

- [ ] **Background Colors Match**
  - Page: #0A0A0A (dark) / #FFFFFF (light)
  - Cards: #1A1A1A (dark) / #F9FAFB (light)

---

## 📐 Measurement Tools

### Chrome DevTools Method

1. Right-click element → "Inspect"
2. **Computed tab** shows actual rendered values:
   - `height`, `width`
   - `padding-left`, `padding-right`, `padding-top`, `padding-bottom`
   - `border-radius`
   - `font-size`, `font-weight`, `font-family`
   - `color` (RGB values)
   - `background-color`

3. **Hover over element** in Elements panel:
   - Shows spacing visualization (margins in orange, padding in green)
   - Shows exact pixel dimensions

### Figma Overlay Method

1. Import both screenshots into Figma
2. Place mobile screenshot on top of web screenshot
3. Reduce mobile opacity to 50%
4. Align same elements (e.g., header text)
5. Visually compare:
   - Button sizes
   - Card spacing
   - Icon sizes
   - Text alignment

### Pixel Ruler Tool

1. Use browser extension "Page Ruler" (Chrome)
2. Drag to measure:
   - Element heights
   - Gaps between elements
   - Border radius (measure corner width)

---

## ✅ Acceptance Criteria

### Per-Screen Checklist

For each screen to be considered "visually consistent":

1. **Layout**
   - ✅ Same visual hierarchy (headers, sections, content)
   - ✅ Same spacing between elements (±2px tolerance)
   - ✅ Same element grouping and alignment

2. **Buttons**
   - ✅ Same height (48px for standard)
   - ✅ Same border-radius (12px)
   - ✅ Same icon size (24px)
   - ✅ Same font size (16px)
   - ✅ Same colors (verify hex codes)

3. **Cards**
   - ✅ Same border-radius (16px or 20px)
   - ✅ Same padding (24px)
   - ✅ Same glass effect (measure opacity)
   - ✅ Same border color

4. **Typography**
   - ✅ Same font family (Urbanist)
   - ✅ Same heading sizes (32px/24px/20px)
   - ✅ Same body text size (16px)
   - ✅ Same font weights (700/600/400)
   - ✅ Same text colors (verify hex)

5. **Icons**
   - ✅ Same icon library (Lucide)
   - ✅ Same icon sizes (24px standard)
   - ✅ Same icon colors
   - ✅ Same icon-text gap (8px)

6. **Spacing**
   - ✅ Same card gaps (24px)
   - ✅ Same section gaps (32px)
   - ✅ Same element gaps (16px)
   - ✅ Same screen margins (16-24px)

---

## 🐛 Common Discrepancies to Look For

### Known Issues (Before Standardization)

These were the main differences before our quick wins update:

1. **Button Border Radius**
   - ❌ Old: Web 8px, Mobile 16px
   - ✅ Fixed: Both now 12px

2. **Button Height**
   - ❌ Old: Web 48px, Mobile 44px
   - ✅ Fixed: Both now 48px

3. **Button Padding**
   - ❌ Old: Web 32px, Mobile varied
   - ✅ Fixed: Both now 24px

4. **Card Border Radius**
   - May vary across screens (not all updated yet)
   - Target: 16px for standard cards, 20px for large

5. **Icon Sizes**
   - May vary (some 20px, some 24px, some 28px)
   - Standardize to: 24px for most UI, 20px for inline text

---

## 📊 Screenshot Organization

### Folder Structure

```
screenshots/
├── mobile/
│   ├── core/
│   │   ├── home.png
│   │   ├── upload.png
│   │   ├── tailor.png
│   │   ├── interview-prep.png
│   │   └── signin.png
│   ├── secondary/
│   │   ├── batch-tailor.png
│   │   ├── cover-letter.png
│   │   ├── applications.png
│   │   └── ...
│   └── settings/
│       ├── settings.png
│       ├── pricing.png
│       └── ...
├── web/
│   ├── core/
│   ├── secondary/
│   └── settings/
└── comparisons/
    ├── home-comparison.png (side-by-side)
    ├── upload-comparison.png
    └── ...
```

---

## 🎯 Next Steps

### Immediate Tasks

1. **Take All Screenshots** (30 min)
   - Run mobile app, capture all screens
   - Run web app, capture all pages
   - Organize into folders

2. **Create Comparison Images** (30 min)
   - Use Figma or Photoshop
   - Place mobile/web side-by-side
   - Save as `[screen]-comparison.png`

3. **Measure & Document Discrepancies** (1 hour)
   - Use DevTools to measure actual values
   - Create spreadsheet of differences
   - Prioritize fixes by screen importance

4. **Fix High-Priority Discrepancies** (2-3 hours)
   - Start with core screens (Home, Upload, Tailor, Interview Prep)
   - Update components to match standards
   - Re-screenshot and verify

---

## 📝 Discrepancy Tracking Template

### Screen: [Screen Name]

**Date Reviewed:** [Date]
**Reviewer:** [Name]
**Status:** [ ] Pass | [ ] Needs Work | [ ] Major Issues

**Discrepancies Found:**

| Element | Mobile Value | Web Value | Standard | Fix Required |
|---------|--------------|-----------|----------|--------------|
| Button height | 48px | 48px | 48px | ✅ Pass |
| Button radius | 12px | 12px | 12px | ✅ Pass |
| Card radius | 16px | 20px | 16px | ⚠️ Web needs update |
| Icon size | 24px | 20px | 24px | ⚠️ Web needs update |

**Priority:** [ ] High | [ ] Medium | [ ] Low

**Estimated Fix Time:** [X hours]

**Notes:**
[Additional context, edge cases, design decisions]

---

## 🔄 Update Frequency

- **After every major feature:** Take new screenshots, verify consistency
- **Before each release:** Full visual QA pass
- **Monthly:** Spot-check random screens for drift
- **After design system changes:** Re-screenshot all affected screens

---

## 📚 Resources

- **Design Standards:** See `DESIGN_STANDARDS.md`
- **Component Library:** Mobile `src/components/glass/`, Web `src/components/`
- **Figma (when created):** [Link to Figma design file]
- **DevTools Guide:** https://developer.chrome.com/docs/devtools/
- **Screenshot Tools:** Built-in OS tools, Chrome DevTools, Figma

---

**Last Updated:** February 22, 2026
**Next Review:** After next deployment
**Questions?** Check `UI_PARITY_ANALYSIS.md` or ask in #design-system
