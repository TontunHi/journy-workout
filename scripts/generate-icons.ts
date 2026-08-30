import fs from "fs";
import path from "path";

// Function to generate a simple valid PNG with an Emerald Green theme (#10b981)
// We can use a lightweight SVG to PNG or write a raw canvas/binary PNG buffer
function createEmeraldIconSVG(size: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f172a"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="#10b981"/>
  <!-- Dumbbell Icon -->
  <g fill="#022c22" transform="translate(${size * 0.25}, ${size * 0.25}) scale(${size / 48})">
    <path d="M6 18h4v12H6zm28 0h4v12h-4zM10 22h28v4H10zM4 20h2v8H4zm38 0h2v8h-2z" />
  </g>
</svg>`;
}

const iconsDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate an uncompressed standard 1x1 base64 emerald PNG for fallback or valid PNG structure
const emeraldPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAIAAAAlKMOJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAVUlEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8GIN6AABV1e2aAAAAABJRU5ErkJggg==";
const pngBuffer = Buffer.from(emeraldPngBase64, "base64");

fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), pngBuffer);
fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), pngBuffer);
fs.writeFileSync(path.join(iconsDir, "icon.svg"), createEmeraldIconSVG(512));

console.log("✅ Generated PWA icons successfully!");
