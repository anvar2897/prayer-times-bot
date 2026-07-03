import type { VercelRequest, VercelResponse } from "@vercel/node";
import { loadPrayerData } from "../../src/kv.js";
import { generateWallpaper } from "../../wallpaper.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let data;
  try {
    data = await loadPrayerData();
  } catch (err) {
    console.error("Failed to load prayer data from Redis:", err);
    return res.status(500).json({ error: "Failed to load prayer data" });
  }

  if (!data || data.prayers.length === 0) {
    return res
      .status(404)
      .json({ error: "No prayer times saved yet. Send them to the bot first." });
  }

  try {
    const imageBuffer = await generateWallpaper(data.prayers, data.range);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", 'inline; filename="prayer_times.jpg"');
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(imageBuffer);
  } catch (err) {
    console.error("Failed to generate wallpaper:", err);
    return res.status(500).json({ error: "Failed to generate wallpaper" });
  }
}
