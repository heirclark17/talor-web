#!/usr/bin/env python3
"""
Create high-quality app icon from source image.
Meets Apple App Store requirements:
- 1024x1024 pixels
- PNG format
- RGB color space
- No transparency (for iOS icon)
"""

from PIL import Image
import os

def create_app_icon(source_path, output_path, size=1024):
    """
    Create a high-quality square app icon from source image.

    Args:
        source_path: Path to source image
        output_path: Path to save the icon
        size: Icon size (default 1024 for iOS)
    """
    # Open the original image
    img = Image.open(source_path)
    print(f"Original image size: {img.size}")
    print(f"Original image mode: {img.mode}")

    # Convert to RGB if needed (remove alpha channel for iOS)
    if img.mode != 'RGB':
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[3])  # Use alpha as mask
        else:
            background.paste(img)
        img = background

    # Make the image square by adding white padding
    width, height = img.size
    max_dim = max(width, height)

    # Create square canvas with white background
    square_img = Image.new('RGB', (max_dim, max_dim), (255, 255, 255))

    # Calculate position to center the original image
    x_offset = (max_dim - width) // 2
    y_offset = (max_dim - height) // 2

    # Paste the original image in center
    square_img.paste(img, (x_offset, y_offset))

    print(f"Square image size: {square_img.size}")

    # Resize to target size with high-quality resampling
    # LANCZOS is the highest quality downsampling filter
    final_img = square_img.resize((size, size), Image.Resampling.LANCZOS)

    print(f"Final image size: {final_img.size}")
    print(f"Final image mode: {final_img.mode}")

    # Save as PNG with maximum quality
    final_img.save(output_path, 'PNG', optimize=True, quality=100)
    print(f"[OK] Icon saved to: {output_path}")

    return final_img

def create_adaptive_icon(source_img, output_path, size=1024):
    """
    Create Android adaptive icon (foreground only).
    Should have transparent padding around the actual icon.
    """
    # For adaptive icons, we want the icon to be smaller (safe zone)
    # The safe zone is about 66% of the total size
    safe_size = int(size * 0.66)

    # Resize the image to fit in safe zone
    img_resized = source_img.resize((safe_size, safe_size), Image.Resampling.LANCZOS)

    # Create transparent background
    adaptive_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))

    # Center the icon
    offset = (size - safe_size) // 2
    adaptive_img.paste(img_resized, (offset, offset))

    # Save as PNG with transparency
    adaptive_img.save(output_path, 'PNG', optimize=True)
    print(f"[OK] Adaptive icon saved to: {output_path}")

if __name__ == '__main__':
    # Paths
    source = 'assets/icon-original.jpg'
    icon_output = 'assets/icon.png'
    adaptive_output = 'assets/adaptive-icon.png'
    splash_output = 'assets/splash-icon.png'

    print("=" * 60)
    print("Creating App Icons for Talor")
    print("=" * 60)

    # Create main app icon (1024x1024 PNG)
    print("\n1. Creating main app icon (iOS/Android)...")
    icon_img = create_app_icon(source, icon_output, size=1024)

    # Create adaptive icon for Android (foreground layer)
    print("\n2. Creating Android adaptive icon...")
    # For adaptive icon, we want the source without the white background
    # But since our source has white bg, we'll create it from the square version
    create_adaptive_icon(icon_img, adaptive_output, size=1024)

    # Create splash screen icon (smaller, centered)
    print("\n3. Creating splash screen icon...")
    splash_img = icon_img.resize((400, 400), Image.Resampling.LANCZOS)
    splash_img.save(splash_output, 'PNG', optimize=True)
    print(f"[OK] Splash icon saved to: {splash_output}")

    print("\n" + "=" * 60)
    print("[OK] All icons created successfully!")
    print("=" * 60)
    print("\nGenerated files:")
    print(f"  - {icon_output} (1024x1024 PNG - main app icon)")
    print(f"  - {adaptive_output} (1024x1024 PNG - Android adaptive)")
    print(f"  - {splash_output} (400x400 PNG - splash screen)")
    print("\nNext steps:")
    print("  1. Restart Expo: npx expo start --clear")
    print("  2. Rebuild the app to see new icon")
    print("  3. For production: run 'eas build' to generate final assets")
