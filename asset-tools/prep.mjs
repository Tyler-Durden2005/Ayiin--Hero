// Cleans background-removed cutouts and exports optimised transparent WebP into ../public/hero
// usage: node prep.mjs <cutDir> <outDir> [name ...]   (names limit which jobs run)
import sharp from "sharp"; import fs from "fs"; import path from "path";
const [cutDir, outDir, ...only] = process.argv.slice(2);
// name -> source cutout, optional bottom crop (fraction of trimmed height kept), long-edge size
const JOBS = {
  sneaker:    { src: "shoe-b" },
  headphones: { src: "hp-a" },
  perfume:    { src: "pf-a", keepBottom: Number(process.env.PF_KEEP || 1) },
  "gaming-chair": { src: "gc-bw" },
  eyewear:    { src: "ac-b" },
};
const LONG = 1600;
fs.mkdirSync(outDir, { recursive: true });
for (const [name, job] of Object.entries(JOBS)) {
  if (only.length && !only.includes(name)) continue;
  const { data, info } = await sharp(path.join(cutDir, job.src + ".png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // kill faint leftover shadow/halo pixels so trim() finds the real silhouette
  for (let i = 3; i < data.length; i += 4) if (data[i] < 28) data[i] = 0;
  let img = sharp(data, { raw: info }).trim({ threshold: 1 });
  let buf = await img.png().toBuffer();
  let meta = await sharp(buf).metadata();
  if (job.keepBottom && job.keepBottom < 1) {
    buf = await sharp(buf).extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * job.keepBottom) }).trim({ threshold: 1 }).png().toBuffer();
    meta = await sharp(buf).metadata();
  }
  const out = path.join(outDir, name + ".webp");
  const r = await sharp(buf).resize({ width: meta.width >= meta.height ? LONG : undefined, height: meta.height > meta.width ? LONG : undefined, withoutEnlargement: true })
    .sharpen({ sigma: 0.6 }).webp({ quality: 88, alphaQuality: 95, effort: 6 }).toFile(out);
  console.log(name, `${r.width}x${r.height}`, (r.size / 1024).toFixed(0) + "KB");
}
