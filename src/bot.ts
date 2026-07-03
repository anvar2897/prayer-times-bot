import { Bot, InputFile } from "grammy";
import { parsePrayerTimes, generateWallpaper } from "../wallpaper.js";
import { saveChatId } from "./kv.js";

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    try {
      await saveChatId(ctx.chat.id);
    } catch (err) {
      // Reminder subscription is best-effort; the wallpaper flow must
      // still work when Redis is unavailable or not configured.
      console.error("Failed to save chat id:", err);
    }
    return ctx.reply(
      "Ассалому алайкум 🕌\n\n" +
      "Намоз вақтларини юборинг — сизга iPhone 15 учун чиройли wallpaper тайёрлайман."
    );
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;

    if (text.startsWith("/")) return;

    const { range, prayers } = parsePrayerTimes(text);

    if (prayers.length === 0) {
      await ctx.reply("Намоз вақтлари аниқланмади. Илтимос форматни текширинг.");
      return;
    }

    await ctx.reply("🎨 Wallpaper is being prepared...");

    try {
      const imageBuffer = await generateWallpaper(prayers, range);

      await ctx.replyWithPhoto(
        new InputFile(imageBuffer, "prayer_times.png"),
        { caption: "🕌 Weekly prayer times" }
      );
    } catch (err) {
      console.error(err);
      await ctx.reply("Wallpaper яратишда хатолик юз берди.");
    }
  });

  bot.catch(console.error);

  return bot;
}
