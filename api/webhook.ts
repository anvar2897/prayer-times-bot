import { webhookCallback } from "grammy";
import { createBot } from "../src/bot.js";

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("BOT_TOKEN not set");
}

const bot = createBot(token);

export default webhookCallback(bot, "next-js", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
});
