import "dotenv/config";
import { Bot, InputFile } from "grammy";
import { parsePrayerTimes, generateWallpaper } from "./wallpaper.js";
import { saveChatId } from "./src/state.js";
import { scheduleWeeklyReminder } from "./src/reminder.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN not set");
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", (ctx) => {
  saveChatId(ctx.chat.id);
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

bot.start();
console.log("Bot running...");

scheduleWeeklyReminder(bot);
console.log("Weekly reminder scheduled (Fridays 09:00)");