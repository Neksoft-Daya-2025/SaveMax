# Save Max generated website assets

Generated with the built-in image-generation tool. These are illustrative website artwork, not listing photographs.

- canal-sunset.webp: photorealistic wide Amsterdam canal at golden sunset, Dutch gabled houses and trees along a shaded left bank, boats, golden reflections and a luminous warm sky on the right; no text or logos.
- living-room.webp: square warm editorial living room, cream sofa and rust cushion, low wood coffee table, potted plant and tall black-framed garden windows in afternoon sunlight; no text or logos.
- dutch-cities.webp: five equal vertical photographic panels showing Amsterdam, Rotterdam, Utrecht, Eindhoven and The Hague, warm realistic city scenes with distinct architecture and dark lower edges; no labels, borders or logos.

Original generated PNGs are kept alongside the WebP delivery assets. WebP encoding preserves dimensions and reduces transfer size.

## Amsterdam hero video
User supplied source: C:/Users/ASUS/Desktop/amsterdamhero.mp4 (unchanged).
Web asset: amsterdam-hero.mp4, full original duration (76.52 seconds), 1280x720, 24 fps, H.264 CRF 27, no audio, yuv420p, faststart.
Poster: amsterdam-hero-poster.webp, frame at 3 seconds, 1280x720, quality 78.
Encode: ffmpeg -i SOURCE -an -vf "scale=1280:-2,fps=24" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart amsterdam-hero.mp4
