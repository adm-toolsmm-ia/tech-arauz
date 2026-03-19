import sys
try:
    from PIL import Image
except ImportError:
    print("PIL not installed")
    sys.exit(0)

def extract_colors(image_path):
    img = Image.open(image_path).convert("RGBA")
    colors = img.getcolors(maxcolors=1000000)
    # Sort by count (descending)
    colors.sort(key=lambda x: x[0], reverse=True)
    
    print(f"Top 10 colors for {image_path}:")
    for count, rgba in colors[:10]:
        if rgba[3] > 0: # ignore transparent
            hex_color = "#{:02x}{:02x}{:02x}".format(rgba[0], rgba[1], rgba[2])
            print(f"{hex_color} - count: {count}")

try:
    extract_colors(r"c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz\docs\temp\Layout\Logo Transparente\LOGO PADRÃO-1.png")
except Exception as e:
    print(f"Error: {e}")
