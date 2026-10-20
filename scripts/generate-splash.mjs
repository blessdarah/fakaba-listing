import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, "..", "assets", "images");

const WIDTH = 1284;
const HEIGHT = 2778;
const LOGO_SIZE = 280;
const BRAND_BLUE = "#1E3A5F";
const WORDMARK_SIZE = 48;

const variants = [
  {
    name: "splash-light",
    bg: "#FFFFFF",
    textFill: BRAND_BLUE,
  },
  {
    name: "splash-dark",
    bg: "#0F172A",
    textFill: "#FFFFFF",
  },
];

async function generate() {
  const iconPath = path.join(ASSETS, "icon.png");
  const logo = await sharp(iconPath)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "inside" })
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const logoW = logoMeta.width;
  const logoH = logoMeta.height;

  // Place logo slightly above center
  const logoX = Math.round((WIDTH - logoW) / 2);
  const logoY = Math.round(HEIGHT / 2 - logoH / 2 - 80);

  // Place wordmark below logo
  const textY = logoY + logoH + 40;

  for (const v of variants) {
    const wordmarkSvg = Buffer.from(`
      <svg width="${WIDTH}" height="${WORDMARK_SIZE + 20}">
        <text
          x="${WIDTH / 2}"
          y="${WORDMARK_SIZE}"
          text-anchor="middle"
          font-family="sans-serif"
          font-weight="700"
          font-size="${WORDMARK_SIZE}px"
          fill="${v.textFill}"
        >Fakaba</text>
      </svg>
    `);

    const out = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: v.bg,
      },
    })
      .composite([
        { input: logo, left: logoX, top: logoY },
        { input: wordmarkSvg, left: 0, top: textY },
      ])
      .png()
      .toFile(path.join(ASSETS, `${v.name}.png`));

    console.log(`✓ ${v.name}.png  (${out.width}x${out.height})`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
