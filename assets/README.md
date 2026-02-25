# Traytic Brand Assets

All logos match the icon used on the landing page: a rounded purple square with three ascending white bars and a green trend dot.

## Files

| File | Use |
|------|-----|
| `icon.svg` | Square icon (512x512). Use as GitHub org avatar, favicon source, or app icon. |
| `logo.svg` | Icon + "Traytic" wordmark (dark text). Use on light backgrounds. |
| `logo-light.svg` | Icon + "Traytic" wordmark (white text). Use on dark backgrounds. |

## GitHub Organization Avatar

Upload `icon.svg` directly — GitHub accepts SVGs. Or export it as a 512x512 PNG first:

```bash
# Inkscape
inkscape icon.svg --export-type=png --export-filename=icon.png -w 512

# ImageMagick
magick icon.svg -resize 512x512 icon.png
```

## Colors

| Element | Hex | Description |
|---------|-----|-------------|
| Background | `#7c3aed` | Violet / purple (Tailwind violet-600) |
| Bars | `#ffffff` | White at 55%, 80%, 100% opacity |
| Trend dot | `#4ade80` | Green (Tailwind green-400) |
| Wordmark (dark) | `#0f172a` | Slate-900 — for light backgrounds |
| Wordmark (light) | `#f8fafc` | Slate-50 — for dark backgrounds |

## Exporting

SVGs are vector — scale to any size without quality loss.

- **Figma / Illustrator / Inkscape** — Open the SVG, then export as PNG, PDF, etc.
- **For the wordmark** — convert the `<text>` element to outlines before exporting to ensure consistent rendering across systems.
