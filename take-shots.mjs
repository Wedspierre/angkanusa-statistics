// Regenerate the four AngkaNusa screenshots DIRECTLY into the repo's
// screenshots/ dir. Serves app/ on a local port, then chrome-headless-shell
// writes its PNG straight to screenshots/<name>.png, PIL re-encodes it to
// screenshots/<name>.jpg in place, then the intermediate PNG is deleted.
// Each shot is a hash route of the site, year fixed at 2024 (the default).
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell`;
const repo = '/home/hatch/workspace/makefun/best-national-statistics-site-20261126-0539-repo/';
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));
const outDir = join(repo, 'screenshots');
mkdirSync(outDir, { recursive: true });

const PORT = 8131;
const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: repo, stdio: 'pipe' });

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}/index.html`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('server did not come up');
}

function pngToJpeg(pngPath, jpgPath, quality) {
  try {
    execFileSync('python3', ['-c',
      `from PIL import Image; im=Image.open(${JSON.stringify(pngPath)}).convert('RGB'); im.save(${JSON.stringify(jpgPath)}, 'JPEG', quality=${quality})`],
      { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

try {
  await waitForServer();
  for (const shot of shots) {
    const png = join(outDir, shot.name.replace(/\.jpg$/, '.png'));
    const jpg = join(outDir, shot.name);
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--no-sandbox',
      `--window-size=${shot.width},${shot.height}`, '--hide-scrollbars',
      '--virtual-time-budget=15000',
      `--screenshot=${png}`,
      `http://localhost:${PORT}/${shot.url}`,
    ], { stdio: 'pipe' });
    if (!existsSync(png)) throw new Error(`no screenshot for ${shot.name}`);
    let quality = 88;
    let ok = pngToJpeg(png, jpg, quality);
    while (ok && statSync(jpg).size > 250 * 1024 && quality > 40) {
      quality -= 10;
      pngToJpeg(png, jpg, quality);
    }
    if (!ok) throw new Error(`PIL conversion failed for ${shot.name}`);
    unlinkSync(png);
    console.log(`${shot.name}: ${statSync(jpg).size} bytes (q${quality})`);
  }
  console.log('done');
} finally {
  server.kill();
}
