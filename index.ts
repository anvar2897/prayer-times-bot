import "dotenv/config";
import { createBot } from "./src/bot.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN not set");
  process.exit(1);
}

// Local development entry point: runs the bot via long polling.
// In production the bot runs as a Telegram webhook (api/webhook.ts) and
// the weekly reminder runs on Vercel Cron (api/cron/reminder.ts).
const bot = createBot(token);

bot.start();
console.log("Bot running (long polling, local dev)...");