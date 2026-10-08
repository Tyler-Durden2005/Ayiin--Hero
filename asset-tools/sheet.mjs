import sharp from "sharp"; import fs from "fs"; import path from "path";
const [dir, out, bg = "#282828"] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => /\.(jpg|png|webp)$/.test(f)).sort();
const T = 300, cols = 6, rows = Math.ceil(files.length / cols), H = T + 22;
const comps = [];
for (let i = 0; i < files.length; i++) {
  const x = (i % cols) * T, y = Math.floor(i / cols) * H;
  const buf = await sharp(path.join(dir, files[i])).resize(T, T, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  comps.push({ input: buf, left: x, top: y });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="22"><text x="4" y="16" font-family="Arial" font-size="14" fill="#fff">${files[i]}</text></svg>`;
  comps.push({ input: Buffer.from(svg), left: x, top: y + T });
}
await sharp({ create: { width: cols * T, height: rows * H, channels: 3, background: bg } }).composite(comps).jpeg({ quality: 82 }).toFile(out);
console.log("ok", files.length);
