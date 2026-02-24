import "dotenv/config";
import { Bot, InputFile } from "grammy";
import { createCanvas, loadImage } from "canvas";
import axios from "axios";
const bot = new Bot(process.env.BOT_TOKEN);
// iPhone 15 resolution
const WIDTH = 1179;
const HEIGHT = 2556;
function parseText(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 6)
        return null;
    const range = lines[0];
    const getTime = (label) => {
        const line = lines.find(l => l.toUpperCase().includes(label));
        if (!line)
            return "";
        return line.split(":").pop()?.trim() || "";
    };
    return {
        range,
        bomdod: getTime("БОМДОД"),
        peshin: getTime("ПЕШИН"),
        asr: getTime("АСР"),
        shom: getTime("ШОМ"),
        hufton: getTime("ХУФТОН")
    };
}
async function getBackground() {
    const response = await axios.get("https://api.unsplash.com/photos/random", {
        params: {
            query: "minimal islamic background dark",
            orientation: "portrait"
        },
        headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
        }
    });
    return response.data.urls.regular;
}
async function generateWallpaper(data) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");
    // Load background
    const bgUrl = await getBackground();
    const bgImage = await loadImage(bgUrl);
    ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT);
    // Dark overlay for readability
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Typography
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    // Weekly range (upper third to avoid lock screen clock)
    ctx.font = "bold 60px Arial";
    ctx.fillText(data.range, WIDTH / 2, HEIGHT * 0.30);
    // Prayer times centered vertically
    ctx.font = "48px Arial";
    const prayers = [
        `БОМДОД   ${data.bomdod}`,
        `ПЕШИН    ${data.peshin}`,
        `АСР      ${data.asr}`,
        `ШОМ      ${data.shom}`,
        `ХУФТОН   ${data.hufton}`
    ];
    let startY = HEIGHT * 0.45;
    prayers.forEach((p, i) => {
        ctx.fillText(p, WIDTH / 2, startY + i * 90);
    });
    return canvas.toBuffer("image/jpeg", { quality: 0.95 });
}
bot.on("message:text", async (ctx) => {
    const parsed = parseText(ctx.message.text);
    if (!parsed) {
        return ctx.reply("Format noto‘g‘ri. Namoz vaqtlarini to‘liq yuboring.");
    }
    try {
        const imageBuffer = await generateWallpaper(parsed);
        await ctx.replyWithPhoto(
  new InputFile(imageBuffer),
  { caption: "📿 Ҳафталик намоз вақтлари" }
);
    }
    catch (err) {
        console.error(err);
        await ctx.reply("Xatolik yuz berdi.");
    }
});
bot.start();
