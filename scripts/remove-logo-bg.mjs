import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceCandidates = [
  "C:\\Users\\user\\.cursor\\projects\\c-Users-user-Documents-myprojecweb\\assets\\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_9a0c902a69ebb20c693d23a744856502_images_image-366b4910-f1b2-4cd5-a5e5-e35ab8e5407f.png",
  path.join(__dirname, "../public/refilab-logo-source.png"),
];
const output = path.join(__dirname, "../public/refilab-logo-tmp.png");

function isBackground(r, g, b) {
  if (r < 28 && g < 28 && b < 28) {
    return true;
  }

  if (r > 232 && g > 232 && b > 232) {
    return true;
  }

  if (r > 145 && g > 165 && b > 185 && b > r + 8 && b > g) {
    return true;
  }

  return false;
}

function decodeImage(input) {
  if (input[0] === 0xff && input[1] === 0xd8) {
    return jpeg.decode(input, { useTArray: true });
  }

  if (
    input[0] === 0x89 &&
    input[1] === 0x50 &&
    input[2] === 0x4e &&
    input[3] === 0x47
  ) {
    const png = PNG.sync.read(input);
    return {
      width: png.width,
      height: png.height,
      data: Uint8Array.from(png.data),
    };
  }

  throw new Error("Unsupported image format");
}

function removeBackground(inputPath) {
  const input = fs.readFileSync(inputPath);
  const { width, height, data } = decodeImage(input);
  const visited = new Uint8Array(width * height);
  const toRemove = new Uint8Array(width * height);
  const queue = [];

  function tryAdd(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return;
    }

    const idx = y * width + x;
    if (visited[idx]) {
      return;
    }

    const offset = idx * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    if (!isBackground(r, g, b)) {
      return;
    }

    visited[idx] = 1;
    queue.push(idx);
  }

  for (let x = 0; x < width; x++) {
    tryAdd(x, 0);
    tryAdd(x, height - 1);
  }

  for (let y = 0; y < height; y++) {
    tryAdd(0, y);
    tryAdd(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.shift();
    toRemove[idx] = 1;

    const x = idx % width;
    const y = Math.floor(idx / width);

    tryAdd(x - 1, y);
    tryAdd(x + 1, y);
    tryAdd(x, y - 1);
    tryAdd(x, y + 1);
  }

  let removed = 0;
  for (let idx = 0; idx < width * height; idx++) {
    if (toRemove[idx]) {
      data[idx * 4 + 3] = 0;
      removed++;
    }
  }

  const png = new PNG({ width, height });
  png.data = Buffer.from(data);
  fs.writeFileSync(output, PNG.sync.write(png));

  console.log(
    `Processed ${inputPath}\nSaved transparent PNG ${width}x${height}\nRemoved ${removed}/${width * height} pixels (${((removed / (width * height)) * 100).toFixed(1)}%)`,
  );
}

const input =
  sourceCandidates.find((candidate) => fs.existsSync(candidate)) ?? sourceCandidates[0];

removeBackground(input);

const finalOutput = path.join(__dirname, "../public/refilab-logo.png");
fs.copyFileSync(output, finalOutput);
fs.unlinkSync(output);
console.log(`Replaced ${finalOutput}`);
