// Removes the background from each source photo -> transparent PNG in ./cut
import { removeBackground } from "@imgly/background-removal-node";
import fs from "fs"; import path from "path"; import { pathToFileURL } from "url";
const [srcDir, outDir, ...only] = process.argv.slice(2);
for (const f of fs.readdirSync(srcDir).filter(f => f.endsWith(".jpg"))) {
  const name = path.basename(f, ".jpg");
  if (only.length && !only.includes(name)) continue;
  const blob = await removeBackground(pathToFileURL(path.resolve(srcDir, f)).href, { model: "medium", output: { format: "image/png" } });
  fs.writeFileSync(path.join(outDir, name + ".png"), Buffer.from(await blob.arrayBuffer()));
  console.log("cut", name);
}
