import { readdir, readFile, writeFile, mkdir, access, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve('public/images');
const output = path.resolve('public/_optimized');
const manifest = {};
const retained = new Set(['manifest.json']);
const settings = 'webp-quality78-widths400-800-1280-v1';
await mkdir(output, { recursive: true });

async function scan(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) { await scan(file); continue; }
    if (!/\.(jpe?g|png|webp|avif|tiff?)$/i.test(entry.name)) continue;
    const input = await readFile(file);
    const metadata = await sharp(input).metadata();
    if ((metadata.pages || 1) > 1) continue;
    const rotated = metadata.orientation >= 5;
    const sourceWidth = rotated ? metadata.height : metadata.width;
    const sourceHeight = rotated ? metadata.width : metadata.height;
    if (!sourceWidth || !sourceHeight) continue;
    const relative = path.relative(path.resolve('public'), file).split(path.sep).join('/');
    const hash = createHash('sha256').update(input).update(settings).digest('hex').slice(0, 12);
    const base = path.parse(entry.name).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const variants = [];
    for (const width of [...new Set([400, 800, 1280].map(size => Math.min(size, sourceWidth)))]) {
      const name = `${base}-${hash}-${width}.webp`;
      const destination = path.join(output, name);
      retained.add(name);
      try { await access(destination); }
      catch { await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(destination); }
      variants.push({ src: `/_optimized/${name}`, width, height: Math.round(sourceHeight * width / sourceWidth) });
    }
    manifest[`/${relative}`] = variants;
  }
}

await scan(root);
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
for (const file of await readdir(output)) {
  if (!retained.has(file) && /\.webp$/.test(file)) await unlink(path.join(output, file));
}
console.log(`Optimized ${Object.keys(manifest).length} image(s); cached WebP variants in public/_optimized.`);
