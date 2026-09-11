// One-off/reusable generator for PWA icon assets, derived from the existing
// transparent-background app icon (src/app/icon.png, 512x512) rather than
// reprocessing the original logo photo from scratch. Run with:
//   node scripts/generate-pwa-icons.mjs
// Re-run whenever the brand icon changes.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SOURCE = "src/app/icon.png";
const OUT_DIR = "public/icons";
const BEIGE = "#f5f0ea";

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Standard "any" purpose icons — transparent background preserved.
  await sharp(SOURCE).resize(192, 192).toFile(`${OUT_DIR}/icon-192.png`);
  await sharp(SOURCE).resize(512, 512).toFile(`${OUT_DIR}/icon-512.png`);

  // Maskable icon: OS may crop this to a circle/rounded-square, so the mark
  // must sit within the inner ~80% "safe zone" on a background that fills
  // the full canvas edge-to-edge.
  const maskableMark = await sharp(SOURCE).resize(410, 410).toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: BEIGE },
  })
    .composite([{ input: maskableMark, gravity: "center" }])
    .png()
    .toFile(`${OUT_DIR}/icon-maskable-512.png`);

  // Apple touch icon: iOS doesn't respect alpha the way Android does, so
  // flatten onto the brand background instead of leaving it transparent.
  const appleMark = await sharp(SOURCE).resize(150, 150).toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: BEIGE },
  })
    .composite([{ input: appleMark, gravity: "center" }])
    .png()
    .toFile("src/app/apple-icon.png");

  console.log("PWA icons generated in public/icons/ and src/app/apple-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
