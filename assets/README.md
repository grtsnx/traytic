# Traytic logo assets

- **`logo.svg`** — Full logo (icon + “Traytic” wordmark). Use for headers, docs, and marketing.
- **`icon.svg`** — Icon only (no wordmark). Use for favicons, app icons, and small sizes.

## Exporting

SVGs are vector and scale to any size. To export as PNG, PDF, or other formats:

1. **Figma** — Drag the SVG into a frame, then use Export (e.g. PNG 1x, 2x, PDF).
2. **Illustrator / Inkscape** — Open the SVG, then File → Export or Save As.
3. **Command line (PNG)** — e.g. with Inkscape:  
   `inkscape logo.svg --export-type=png --export-filename=logo.png -w 400`

For consistent appearance of the wordmark everywhere (e.g. print), convert the “Traytic” text to outlines in your design tool before exporting.

## Colors

- Gradient: `#0ea5e9` → `#6366f1` (sky → indigo)
- Wordmark: `#0f172a` (slate-900). For dark backgrounds, change the text `fill` to `#f8fafc` or white.
