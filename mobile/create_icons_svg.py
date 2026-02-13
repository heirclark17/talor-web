#!/usr/bin/env python3
"""
Create high-quality app icons from SVG using svglib + reportlab.
Works on Windows without additional C libraries.
"""

from svglib.svglib import svg2rlg
from reportlab.graphics import renderPM
from PIL import Image
import os

def svg_to_png_svglib(svg_path, output_path, size=1024, background='white'):
    """
    Convert SVG to PNG using svglib + reportlab.

    Args:
        svg_path: Path to source SVG file
        output_path: Path to save PNG
        size: Output size (width and height for square)
        background: Background color
    """
    print(f"Converting SVG to {size}x{size} PNG...")

    # Load SVG as ReportLab drawing
    drawing = svg2rlg(svg_path)

    if drawing is None:
        raise ValueError(f"Failed to load SVG: {svg_path}")

    # Get original dimensions
    orig_width = drawing.width
    orig_height = drawing.height

    print(f"  Original SVG size: {orig_width} x {orig_height}")

    # Scale to fit in square while maintaining aspect ratio
    scale = min(size / orig_width, size / orig_height)
    drawing.width = size
    drawing.height = size
    drawing.scale(scale, scale)

    # Render to PNG
    renderPM.drawToFile(drawing, output_path, fmt='PNG', dpi=72, bg=0xffffff if background == 'white' else None)

    # Open with PIL to verify and convert to RGB if needed
    img = Image.open(output_path)

    # Ensure RGB mode for iOS (no alpha)
    if img.mode == 'RGBA' and background == 'white':
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
        img = rgb_img

    # Ensure square by padding if needed
    if img.width != size or img.height != size:
        square_img = Image.new('RGB', (size, size), (255, 255, 255))
        offset_x = (size - img.width) // 2
        offset_y = (size - img.height) // 2
        square_img.paste(img, (offset_x, offset_y))
        img = square_img

    # Save final image
    img.save(output_path, 'PNG', optimize=True)

    print(f"  [OK] Saved: {output_path} ({img.width}x{img.height}, {img.mode})")

    return img

def create_adaptive_icon_svg(svg_path, output_path, size=1024):
    """
    Create Android adaptive icon with transparency.
    """
    print(f"\nCreating Android adaptive icon...")

    # Render at smaller size for safe zone
    safe_size = int(size * 0.66)

    # Load and render SVG
    drawing = svg2rlg(svg_path)
    orig_width = drawing.width
    orig_height = drawing.height

    # Scale to fit in safe zone
    scale = min(safe_size / orig_width, safe_size / orig_height)
    drawing.width = safe_size
    drawing.height = safe_size
    drawing.scale(scale, scale)

    # Render to PNG (with transparency)
    temp_path = output_path + '.temp.png'
    renderPM.drawToFile(drawing, temp_path, fmt='PNG', dpi=72)

    # Load and center on transparent canvas
    icon_img = Image.open(temp_path)

    # Create transparent canvas
    adaptive_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Center the icon
    offset_x = (size - icon_img.width) // 2
    offset_y = (size - icon_img.height) // 2

    if icon_img.mode == 'RGBA':
        adaptive_img.paste(icon_img, (offset_x, offset_y), icon_img)
    else:
        icon_rgba = icon_img.convert('RGBA')
        adaptive_img.paste(icon_rgba, (offset_x, offset_y))

    # Save
    adaptive_img.save(output_path, 'PNG', optimize=True)
    os.remove(temp_path)

    print(f"  [OK] Saved: {output_path} ({adaptive_img.width}x{adaptive_img.height}, {adaptive_img.mode})")

    return adaptive_img

if __name__ == '__main__':
    svg_source = 'assets/icon-source.svg'
    icon_output = 'assets/icon.png'
    adaptive_output = 'assets/adaptive-icon.png'
    splash_output = 'assets/splash-icon.png'
    favicon_output = 'assets/favicon.png'

    print("=" * 70)
    print("Creating High-Quality App Icons from Vector SVG")
    print("=" * 70)

    if not os.path.exists(svg_source):
        print(f"\n[ERROR] SVG source not found: {svg_source}")
        exit(1)

    print(f"\nSource: {svg_source}")
    print("Vector graphics = Perfect quality!\n")

    # 1. Main app icon (1024x1024 PNG RGB)
    print("1. Creating main app icon (1024x1024)...")
    main_icon = svg_to_png_svglib(svg_source, icon_output, size=1024, background='white')

    # 2. Android adaptive icon
    print("\n2. Creating Android adaptive icon (1024x1024 with transparency)...")
    adaptive_icon = create_adaptive_icon_svg(svg_source, adaptive_output, size=1024)

    # 3. Splash screen icon
    print("\n3. Creating splash screen icon (400x400)...")
    splash_icon = svg_to_png_svglib(svg_source, splash_output, size=400, background='white')

    # 4. Favicon
    print("\n4. Creating favicon (48x48)...")
    favicon = svg_to_png_svglib(svg_source, favicon_output, size=48, background='white')

    print("\n" + "=" * 70)
    print("[OK] All icons created from vector SVG!")
    print("=" * 70)

    print("\nGenerated files:")
    print(f"  - {icon_output} (1024x1024 RGB - iOS/Android)")
    print(f"  - {adaptive_output} (1024x1024 RGBA - Android adaptive)")
    print(f"  - {splash_output} (400x400 RGB - Splash screen)")
    print(f"  - {favicon_output} (48x48 RGB - Web)")

    print("\nNext steps:")
    print("  1. Restart Expo: npx expo start --clear")
    print("  2. Build: npx expo run:ios")
    print("  3. Your vector icon will be crisp at all sizes!")
