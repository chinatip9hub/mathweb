import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const sourcesDir = path.join(root, "public/avatar-sources");
const outDir = path.join(root, "public/avatars");

const SIZE = 512;
const BG = { r: 246, g: 241, b: 233 };
const CANVAS_PADDING = 0.08;

const OFFICERS_SOURCE = path.join(sourcesDir, "officers-reference.png");
const STUDENTS_SOURCE = path.join(sourcesDir, "students-reference.png");

/** Panel bounds from brightness analysis of the reference sheets. */
const CROPS = [
  {
    source: OFFICERS_SOURCE,
    output: "officer-male.png",
    left: 59,
    top: 17,
    width: 152,
    height: 244,
  },
  {
    source: OFFICERS_SOURCE,
    output: "officer-female.png",
    left: 315,
    top: 17,
    width: 190,
    height: 244,
  },
  {
    source: STUDENTS_SOURCE,
    output: "student-boy-uniform.png",
    left: 56,
    top: 121,
    width: 275,
    height: 561,
  },
  {
    source: STUDENTS_SOURCE,
    output: "student-boy-hoodie.png",
    left: 381,
    top: 121,
    width: 271,
    height: 561,
  },
  {
    source: STUDENTS_SOURCE,
    output: "student-girl-atit.png",
    left: 696,
    top: 121,
    width: 328,
    height: 561,
  },
];

/** Full portrait images provided separately (not cropped from reference sheets). */
const STANDALONE_AVATARS = [
  {
    source: path.join(sourcesDir, "student-boy-rmutt-source.png"),
    output: "student-boy-rmutt.png",
  },
];

function isNeutralBackground(r, g, b) {
  const average = (r + g + b) / 3;
  const maxDiff = Math.max(
    Math.abs(r - g),
    Math.abs(g - b),
    Math.abs(r - b),
  );

  return maxDiff <= 18 && average >= 198;
}

function findOpaqueBounds(data, width, height, channels) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      if (data[index + 3] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { left: 0, top: 0, width, height };
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  const padX = Math.round(contentWidth * 0.05);
  const padY = Math.round(contentHeight * 0.05);

  return {
    left: Math.max(0, minX - padX),
    top: Math.max(0, minY - padY),
    width: Math.min(width - Math.max(0, minX - padX), contentWidth + padX * 2),
    height: Math.min(
      height - Math.max(0, minY - padY),
      contentHeight + padY * 2,
    ),
  };
}

function markOuterBackground(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const stack = [];

  const pushIfBackground = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return;
    }

    const point = y * width + x;
    if (visited[point]) {
      return;
    }

    const index = point * channels;
    if (
      isNeutralBackground(
        data[index],
        data[index + 1],
        data[index + 2],
      )
    ) {
      visited[point] = 1;
      stack.push(point);
    }
  };

  for (let x = 0; x < width; x += 1) {
    pushIfBackground(x, 0);
    pushIfBackground(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    pushIfBackground(0, y);
    pushIfBackground(width - 1, y);
  }

  while (stack.length > 0) {
    const point = stack.pop();
    const x = point % width;
    const y = (point - x) / width;
    const index = point * channels;
    data[index + 3] = 0;

    pushIfBackground(x + 1, y);
    pushIfBackground(x - 1, y);
    pushIfBackground(x, y + 1);
    pushIfBackground(x, y - 1);
  }

  for (let point = 0; point < width * height; point += 1) {
    const index = point * channels;
    if (data[index + 3] !== 0) {
      data[index + 3] = 255;
    }
  }
}

async function centerOnCanvas(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  markOuterBackground(data, width, height, channels);

  const bounds = findOpaqueBounds(data, width, height, channels);
  const cutout = await sharp(data, {
    raw: { width, height, channels },
  })
    .extract(bounds)
    .png()
    .toBuffer();

  const innerSize = Math.round(SIZE * (1 - CANVAS_PADDING * 2));
  const resized = await sharp(cutout)
    .resize(innerSize, innerSize, {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const left = Math.round((SIZE - (meta.width ?? innerSize)) / 2);
  const top = Math.round((SIZE - (meta.height ?? innerSize)) / 2);

  return sharp({
    create: {
      width: SIZE,
      height: SIZE,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function cropAvatar({ source, output, left, top, width, height }) {
  const extracted = await sharp(source)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  const centered = await centerOnCanvas(extracted);
  const outPath = path.join(outDir, output);
  await sharp(centered).toFile(outPath);
  console.log("wrote", output);
}

async function processStandaloneAvatar({ source, output }) {
  const input = await sharp(source).png().toBuffer();
  const centered = await centerOnCanvas(input);
  const outPath = path.join(outDir, output);
  await sharp(centered).toFile(outPath);
  console.log("wrote", output);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const outputs = [
    ...CROPS.map((crop) => crop.output),
    ...STANDALONE_AVATARS.map((avatar) => avatar.output),
  ];

  for (const file of outputs) {
    const filePath = path.join(outDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  for (const crop of CROPS) {
    await cropAvatar(crop);
  }

  for (const avatar of STANDALONE_AVATARS) {
    await processStandaloneAvatar(avatar);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
