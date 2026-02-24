import {
  createCanvas,
  registerFont,
  loadImage,
  type CanvasRenderingContext2D,
} from "canvas";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fetch from "node-fetch";
import axios from "axios";

/* --------------------------------------------------
   Fix __dirname for ES Modules
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* --------------------------------------------------
   Register Font (Cyrillic + Latin support)
   Place font at: fonts/NotoSans-Regular.ttf
-------------------------------------------------- */
registerFont(
  path.join(process.cwd(), "fonts", "NotoSans-Regular.ttf"),
  { family: "NotoSans" }
);

/* --------------------------------------------------
   Types
-------------------------------------------------- */
interface PrayerTime {
  name: string;
  time: string;
}

/* --------------------------------------------------
   Parse Prayer Times (Cyrillic + Latin)
   Supports:
   БОМДОД: 06:35
   Fajr: 5:15
-------------------------------------------------- */
export function parsePrayerTimes(text: string): {
  range: string | null;
  prayers: PrayerTime[];
} {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  let range: string | null = null;
  const prayers: PrayerTime[] = [];

  // Detect week range (first line if no time inside)
  if (lines.length > 0 && !/\d{1,2}[:.]\d{2}/.test(lines[0])) {
    range = lines[0];
  }

  for (const line of lines) {
    const match = line.match(
      /^([\p{L}\s]+?)\s*[:\-–—]\s*(\d{1,2}[:.]\d{2})/u
    );

    if (match) {
      prayers.push({
        name: match[1].trim(),
        time: match[2].trim(),
      });
    }
  }

  return { range, prayers };
}

/* --------------------------------------------------
   Fetch Background from Unsplash
-------------------------------------------------- */
async function fetchBackgroundImage(): Promise<Buffer | null> {
  const queries = [
    "mosque sunset",
    "islamic architecture night",
    "crescent moon sky",
    "minimal dark landscape",
    "islamic geometric pattern"
  ];

  const query = queries[Math.floor(Math.random() * queries.length)];

  try {
    const response = await axios.get(
      "https://api.unsplash.com/photos/random",
      {
        params: {
          query,
          orientation: "portrait",
        },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    const imageUrl = response.data.urls.regular;

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    return Buffer.from(imageResponse.data);
  } catch (error) {
    console.log("Official Unsplash API failed:", error);
    return null;
  }
}

/* --------------------------------------------------
   Fallback Gradient Background
-------------------------------------------------- */
function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
) {
  const palettes = [
    ["#0f0c29", "#302b63", "#24243e"],
    ["#1a1a2e", "#16213e", "#0f3460"],
    ["#0d1b2a", "#1b2838", "#2c3e50"],
    ["#1b0a2e", "#2d1b69", "#5b2c8e"],
    ["#0a2e1b", "#1b4332", "#2d6a4f"],
  ];

  const p = palettes[Math.floor(Math.random() * palettes.length)];
  const grad = ctx.createLinearGradient(0, 0, W, H);

  grad.addColorStop(0, p[0]);
  grad.addColorStop(0.5, p[1]);
  grad.addColorStop(1, p[2]);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

/* --------------------------------------------------
   Generate Wallpaper (iPhone 15 size)
-------------------------------------------------- */
export async function generateWallpaper(
  prayers: PrayerTime[],
  range: string | null
): Promise<Buffer>{
  const W = 1179;
  const H = 2556;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Try real image
  const bg = await fetchBackgroundImage();

  if (bg) {
    try {
      const img = await loadImage(bg);
      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;

      ctx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh);
    } catch {
      drawGradientBackground(ctx, W, H);
    }
  } else {
    drawGradientBackground(ctx, W, H);
  }
console.log("Background loaded:", !!bg);

  // Dark overlay for readability
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, W, H);

  /* -----------------------------------------
     iPhone Lock Screen Safe Area
     Avoid:
     - Top clock area (~0-30%)
     - Bottom controls (~bottom 10%)
  ------------------------------------------ */

// === Draw Week Range (Upper Safe Zone) ===
if (range) {
  ctx.font = "600 54px NotoSans";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Position around 28% height (below lockscreen clock)
  ctx.fillText(range, W / 2, H * 0.40);
}

  const safeTop = Math.round(H * 0.45);
  const safeBottom = Math.round(H * 0.75);
  const safeHeight = safeBottom - safeTop;

  const rowHeight = 90;
  const rowGap = 40;

  const totalHeight =
    prayers.length * rowHeight + (prayers.length - 1) * rowGap;

  const startY = safeTop + (safeHeight - totalHeight) / 2;

  const blockWidth = 650;
  const blockX = (W - blockWidth) / 2;

  prayers.forEach((prayer, i) => {
    const y = startY + i * (rowHeight + rowGap);
    const centerY = y + rowHeight / 2;

    // Prayer name
    ctx.font = "600 46px NotoSans";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(prayer.name, blockX, centerY);

    // Time
    ctx.font = "400 46px NotoSans";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "right";
    ctx.fillText(prayer.time, blockX + blockWidth, centerY);

    // Separator line
    if (i < prayers.length - 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(blockX, y + rowHeight + rowGap / 2);
      ctx.lineTo(blockX + blockWidth, y + rowHeight + rowGap / 2);
      ctx.stroke();
    }
  });

  return canvas.toBuffer("image/jpeg", { quality: 0.9 });
}