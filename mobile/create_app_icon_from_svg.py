#!/usr/bin/env python3
"""
Create high-quality app icons from SVG source.
Uses vector graphics for perfect quality at any size.

Meets Apple App Store requirements:
- 1024x1024 pixels
- PNG format
- RGB color space
"""

import cairosvg
from PIL import Image
import io
import os

def svg_to_png(svg_path, output_path, size=1024, background='white'):
    """
    Convert SVG to PNG at specified size with perfect quality.

    Args:
        svg_path: Path to source SVG file
        output_path: Path to save PNG
        size: Output size (width and height for square)
        background: Background color (default white for iOS)
    """
    print(f"Converting SVG to PNG ({size}x{size})...")

    # Convert SVG to PNG bytes using cairosvg
    png_bytes = cairosvg.svg2png(
        url=svg_path,
        output_width=size,
        output_height=size,
        background_color=background
    )

    # Open PNG from bytes with PIL
    img = Image.open(io.BytesIO(png_bytes))

    # Convert to RGB if needed (remove alpha for iOS main icon)
    if img.mode == 'RGBA' and background == 'white':
        # Create white background
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        rgb_img.paste(img, mask=img.split()[3])  # Use alpha as mask
        img = rgb_img

    # Save with maximum quality
    img.save(output_path, 'PNG', optimize=True)

    print(f"  [OK] Saved: {output_path}")
    print(f"  Size: {img.size}, Mode: {img.mode}")

    return img

def create_adaptive_icon_from_svg(svg_path, output_path, size=1024):
    """
    Create Android adaptive icon with transparent background.
    Icon is sized to fit in the safe zone (66% of canvas).
    """
    print(f"\nCreating Android adaptive icon...")

    # For adaptive icons, render smaller to fit in safe zone
    safe_size = int(size * 0.66)

    # Convert SVG to PNG with transparency
    png_bytes = cairosvg.svg2png(
        url=svg_path,
        output_width=safe_size,
        output_height=safe_size,
        background_color=None  # Transparent
    )

    # Open PNG from bytes
    icon_img = Image.open(io.BytesIO(png_bytes))

    # Ensure RGBA mode for transparency
    if icon_img.mode != 'RGBA':
        icon_img = icon_img.convert('RGBA')

    # Create transparent canvas
    adaptive_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Center the icon in the canvas
    offset = (size - safe_size) // 2
    adaptive_img.paste(icon_img, (offset, offset), icon_img)

    # Save with transparency
    adaptive_img.save(output_path, 'PNG', optimize=True)

    print(f"  [OK] Saved: {output_path}")
    print(f"  Size: {adaptive_img.size}, Mode: {adaptive_img.mode}")

    return adaptive_img

if __name__ == '__main__':
    # Paths
    svg_source = 'assets/icon-source.svg'
    icon_output = 'assets/icon.png'
    adaptive_output = 'assets/adaptive-icon.png'
    splash_output = 'assets/splash-icon.png'
    favicon_output = 'assets/favicon.png'

    print("=" * 70)
    print("Creating High-Quality App Icons from Vector SVG")
    print("=" * 70)

    # Verify SVG exists
    if not os.path.exists(svg_source):
        print(f"\n[ERROR] SVG source not found: {svg_source}")
        print("Please ensure TalorAppLogo.svg is copied to assets/icon-source.svg")
        exit(1)

    print(f"\nSource: {svg_source}")
    print("Vector graphics = Perfect quality at any size!\n")

    # 1. Main app icon (1024x1024 PNG RGB)
    print("1. Creating main app icon (iOS/Android)...")
    main_icon = svg_to_png(
        svg_source,
        icon_output,
        size=1024,
        background='white'
    )

    # 2. Android adaptive icon (1024x1024 PNG RGBA with transparency)
    adaptive_icon = create_adaptive_icon_from_svg(
        svg_source,
        adaptive_output,
        size=1024
    )

    # 3. Splash screen icon (400x400 PNG RGB)
    print("\n3. Creating splash screen icon...")
    splash_icon = svg_to_png(
        svg_source,
        splash_output,
        size=400,
        background='white'
    )

    # 4. Favicon (48x48 PNG for web)
    print("\n4. Creating favicon...")
    favicon = svg_to_png(
        svg_source,
        favicon_output,
        size=48,
        background='white'
    )

    print("\n" + "=" * 70)
    print("[OK] All icons created successfully from vector SVG!")
    print("=" * 70)

    print("\nGenerated files:")
    print(f"  - {icon_output}")
    print(f"    1024x1024 PNG RGB - Main app icon (iOS & Android)")
    print(f"  - {adaptive_output}")
    print(f"    1024x1024 PNG RGBA - Android adaptive icon")
    print(f"  - {splash_output}")
    print(f"    400x400 PNG RGB - Splash screen")
    print(f"  - {favicon_output}")
    print(f"    48x48 PNG RGB - Web favicon")

    print("\nQuality benefits from SVG:")
    print("  [OK] Perfect sharpness (vector to raster)")
    print("  [OK] No upscaling artifacts")
    print("  [OK] Clean edges and curves")
    print("  [OK] Optimal file size")

    print("\nNext steps:")
    print("  1. Restart Expo: npx expo start --clear")
    print("  2. Build app: npx expo run:ios")
    print("  3. See your icon on the device/simulator!")

    print("\nFor production:")
    print("  Run: eas build --platform ios")
    print("  Your vector icon will look perfect at all sizes")
    print("\n" + "=" * 70)
