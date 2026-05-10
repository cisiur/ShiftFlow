/**
 * ShiftFlow — Icon & Splash generator
 *
 * Converts SVG sources in /assets into the PNGs that Expo needs for
 * iOS, Android (adaptive icon), and web (favicon).
 *
 * Prerequisites:
 *   npm install --save-dev sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *   # or via package.json script:
 *   npm run generate-icons
 *
 * Output files (all written to /assets):
 *   icon.png            1024×1024  iOS + general Expo icon
 *   adaptive-icon.png   1024×1024  Android adaptive foreground layer
 *   splash.png          1242×2688  Splash screen (iPhone 14 Pro Max res)
 *   favicon.png           64×64   Web favicon
 */

const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');

const ASSETS  = path.resolve(__dirname, '..', 'assets');
const SCRIPTS = __dirname;

// ── Target list ───────────────────────────────────────────────────────────────
//  { src: SVG filename, out: PNG filename, width, height }
const TARGETS = [
  { src: 'icon.svg',          out: 'icon.png',          width: 1024, height: 1024 },
  { src: 'adaptive-icon.svg', out: 'adaptive-icon.png', width: 1024, height: 1024 },
  { src: 'splash.svg',        out: 'splash.png',        width: 1242, height: 2688 },
  { src: 'icon.svg',          out: 'favicon.png',       width:   64, height:   64 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pad(str, len) {
  return String(str).padEnd(len, ' ');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function generate() {
  // Verify sharp is available
  let sharpLib;
  try {
    sharpLib = require('sharp');
  } catch {
    console.error('\n❌  sharp not found. Run:\n\n    npm install --save-dev sharp\n');
    process.exit(1);
  }

  console.log('\n🎨  ShiftFlow Icon Generator\n');
  console.log(pad('File', 26), pad('Size', 14), 'Output');
  console.log('─'.repeat(62));

  const results = [];

  for (const t of TARGETS) {
    const srcPath = path.join(ASSETS, t.src);
    const outPath = path.join(ASSETS, t.out);

    if (!fs.existsSync(srcPath)) {
      console.error(`❌  Source not found: ${t.src}`);
      continue;
    }

    try {
      await sharpLib(srcPath)
        .resize(t.width, t.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(outPath);

      const bytes = fs.statSync(outPath).size;
      const dim   = `${t.width}×${t.height}`;
      console.log(`✅  ${pad(t.out, 26)} ${pad(dim, 14)} ${formatBytes(bytes)}`);
      results.push({ file: t.out, ok: true });
    } catch (err) {
      console.error(`❌  Failed to generate ${t.out}: ${err.message}`);
      results.push({ file: t.out, ok: false });
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log('─'.repeat(62));
  console.log(`\n${passed} generated${failed ? `, ${failed} failed` : ''}\n`);

  if (failed > 0) process.exit(1);
}

generate();
