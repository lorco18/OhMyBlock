#!/usr/bin/env python3
"""
Generate placeholder PWA icons
Requires: Pillow (pip install Pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("Error: Pillow not installed.")
    print("Install with: pip install Pillow")
    exit(1)

# Icon sizes needed for PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
ICON_DIR = "assets/icons"
BG_COLOR = "#007AFF"
TEXT_COLOR = "#FFFFFF"

def create_icon(size):
    """Create a simple calendar icon"""
    # Create image with blue background
    img = Image.new('RGB', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw a simple calendar shape
    margin = size // 8
    
    # Calendar body (white rectangle)
    body_top = margin * 2
    draw.rectangle(
        [margin, body_top, size - margin, size - margin],
        fill=TEXT_COLOR
    )
    
    # Calendar header (blue)
    header_height = size // 6
    draw.rectangle(
        [margin, body_top, size - margin, body_top + header_height],
        fill=BG_COLOR
    )
    
    # Calendar rings/holes (white circles on blue header)
    ring_radius = size // 20
    ring_y = body_top + header_height // 2
    ring_x1 = margin * 2
    ring_x2 = size - margin * 2
    
    draw.ellipse(
        [ring_x1 - ring_radius, ring_y - ring_radius,
         ring_x1 + ring_radius, ring_y + ring_radius],
        fill=TEXT_COLOR
    )
    draw.ellipse(
        [ring_x2 - ring_radius, ring_y - ring_radius,
         ring_x2 + ring_radius, ring_y + ring_radius],
        fill=TEXT_COLOR
    )
    
    # Grid lines (simple grid on body)
    grid_margin = margin + size // 20
    grid_size = size - margin * 2 - size // 10
    grid_top = body_top + header_height + size // 20
    
    # Horizontal lines
    for i in range(1, 4):
        y = grid_top + (grid_size // 4) * i
        draw.line(
            [(grid_margin, y), (size - grid_margin, y)],
            fill=BG_COLOR,
            width=max(1, size // 100)
        )
    
    # Vertical lines
    for i in range(1, 4):
        x = grid_margin + (grid_size // 4) * i
        draw.line(
            [(x, grid_top), (x, size - margin - size // 20)],
            fill=BG_COLOR,
            width=max(1, size // 100)
        )
    
    return img

def main():
    # Create icons directory if it doesn't exist
    os.makedirs(ICON_DIR, exist_ok=True)
    
    print("Generating PWA icons...")
    print(f"Output directory: {ICON_DIR}")
    print()
    
    for size in SIZES:
        filename = f"{ICON_DIR}/icon-{size}.png"
        icon = create_icon(size)
        icon.save(filename, 'PNG')
        print(f"✓ Created {filename} ({size}x{size})")
    
    print()
    print("Icon generation complete!")
    print()
    print("Note: These are simple placeholder icons.")
    print("For production, consider creating custom icons with:")
    print("  - Professional design tools (Figma, Illustrator)")
    print("  - Online generators (realfavicongenerator.net)")

if __name__ == "__main__":
    main()
