import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../public/avatars");

const SIZE = 512;
// Uniform cream background for every avatar.
const BG = { r: 246, g: 241, b: 233 };
// How close a pixel must be to the sampled edge color to count as background.
const THRESHOLD = 62;

const FILES = [
  "student-boy-uniform.png",
  "student-boy-hoodie.png",
  "student-boy-rmutt.png",
  "student-girl-atit.png",
  "officer-male.png",
  "officer-female.png",
];

function dist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

async function normalize(file) {
  const input = path.join(dir, file);

  // Center-cover crop to a consistent square, same for cropped + generated art.
  const { data, info } = await sharp(input)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Sample edge pixels to estimate the current background color.
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let count = 0;
  const sampleEdge = (x, y) => {
    const i = (y * width + x) * channels;
    sr += data[i];
    sg += data[i + 1];
    sb += data[i + 2];
    count += 1;
  };
  for (let x = 0; x < width; x += 4) {
    sampleEdge(x, 0);
    sampleEdge(x, height - 1);
  }
  for (let y = 0; y < height; y += 4) {
    sampleEdge(0, y);
    sampleEdge(width - 1, y);
  }
  const br = sr / count;
  const bg = sg / count;
  const bb = sb / count;

  // Flood fill from the borders so only background touching the edge is
  // recolored (protects white shirts inside the character).
  const visited = new Uint8Array(width * height);
  const stack = [];
  const pushIfBg = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const i = p * channels;
    if (dist(data[i], data[i + 1], data[i + 2], br, bg, bb) <= THRESHOLD) {
      visited[p] = 1;
      stack.push(p);
    }
  };

  for (let x = 0; x < width; x += 1) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (stack.length > 0) {
    const p = stack.pop();
    const x = p % width;
    const y = (p - x) / width;
    const i = p * channels;
    data[i] = BG.r;
    data[i + 1] = BG.g;
    data[i + 2] = BG.b;
    data[i + 3] = 255;
    pushIfBg(x + 1, y);
    pushIfBg(x - 1, y);
    pushIfBg(x, y + 1);
    pushIfBg(x, y - 1);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(input + ".tmp");

  fs.renameSync(input + ".tmp", input);
  console.log("normalized", file);
}

async function main() {
  for (const file of FILES) {
    await normalize(file);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
