# Icon Generation Guide

## Overview

App icons are generated from the vector SVG source using Node.js + Sharp.

## Prerequisites

**Note:** Sharp is an **optional dependency** that's only needed for local icon generation, not for building the app.

```bash
# Install sharp locally (optional, only for icon generation)
npm install sharp
```

## Generate Icons

Run the icon generation script to create all required app icons from the SVG source:

```bash
# Generate all icons (icon.png, adaptive-icon.png, splash-icon.png, favicon.png)
node create-icons.js
```

This will:
1. Read `assets/icon-cropped.svg` (vector source)
2. Generate PNG icons at various sizes:
   - `icon.png` - 1024x1024 (main iOS/Android icon)
   - `adaptive-icon.png` - 1024x1024 RGBA (Android adaptive)
   - `splash-icon.png` - 400x400 (splash screen)
   - `favicon.png` - 48x48 (web)

## Source Files

- **`assets/icon-source.svg`** - Original full-canvas SVG from designer
- **`assets/icon-cropped.svg`** - Cropped viewBox version (used for generation)
- **`create-icons.js`** - Icon generation script

## When to Regenerate

Regenerate icons whenever:
- The SVG design is updated
- Icon sizing needs adjustment
- New icon sizes are needed

## Troubleshooting

### Sharp installation fails on Windows

Sharp has native dependencies that may fail on some Windows systems. This is okay because:

1. **Sharp is optional** - it's only needed for icon generation
2. **Icons are already generated** and committed to the repo
3. **EAS Build doesn't need Sharp** - it uses the pre-generated PNG icons

If you need to regenerate icons and Sharp won't install:

**Option 1: Use a different machine**
- macOS or Linux typically have better native module support
- Or use WSL2 on Windows

**Option 2: Use online SVG converter**
- Upload `assets/icon-cropped.svg` to an online SVG → PNG converter
- Generate at 1024x1024 with white background
- Save as `assets/icon.png`

**Option 3: Use EAS Build to generate**
- Sharp works fine in EAS Build's Linux environment
- Add a prebuild script if needed

## Notes

- Generated icons are committed to git (in `/assets`)
- Sharp is in `optionalDependencies` so builds don't fail if it can't install
- Icon generation is a **local development task**, not part of the app build process
