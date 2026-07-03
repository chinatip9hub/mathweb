import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, "../app");
const sourcePath = path.join(
  __dirname,
  "../public/refilab-favicon-source.png",
);

function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

const source = sharp(sourcePath).rotate();

await source.clone().resize(32, 32, { fit: "cover" }).png().toFile(path.join(appDir, "icon.png"));
await source
  .clone()
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(path.join(appDir, "apple-icon.png"));

const icon32Buf = await source
  .clone()
  .resize(32, 32, { fit: "cover" })
  .ensureAlpha()
  .png()
  .toBuffer();
fs.writeFileSync(path.join(appDir, "favicon.ico"), pngToIco(icon32Buf, 32));

console.log("Created app/icon.png (32x32)");
console.log("Created app/apple-icon.png (180x180)");
console.log("Created app/favicon.ico");
