# Drops stray background-removal leftovers: keeps only the chair's own connected blob.
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
a = im.getchannel("A")
solid = a.point(lambda v: 255 if v > 110 else 0)
ys = [y for y in range(0, im.height, 8) for x in range(0, im.width, 8) if solid.getpixel((x, y))]
xs = [x for y in range(0, im.height, 8) for x in range(0, im.width, 8) if solid.getpixel((x, y))]
seed = (sorted(xs)[len(xs) // 2], sorted(ys)[len(ys) // 2])
if not solid.getpixel(seed):
    raise SystemExit(f"seed {seed} is not on the chair")
ImageDraw.floodfill(solid, seed, 128)
keep = solid.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(9))
im.putalpha(Image.composite(a, Image.new("L", im.size, 0), keep))
im.save(out)
print("seed", seed, "size", im.size)
