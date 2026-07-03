import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Bot } from "grammy";
import { loadChatId } from "../../src/kv.js";
import { buildReminderMessage } from "../../src/reminder.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = process.env.BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "BOT_TOKEN not set" });
  }

  let chatId: number | null;
  try {
    chatId = await loadChatId();
  } catch (err) {
    console.error("Failed to load chat id from Redis:", err);
    return res.status(500).json({ error: "Failed to load chat id from Redis" });
  }
  if (!chatId) {
    return res.status(200).json({ skipped: true, reason: "no chat id saved yet" });
  }

  const bot = new Bot(token);

  try {
    await bot.api.sendMessage(chatId, buildReminderMessage());
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("Failed to send weekly reminder:", err);
    return res.status(500).json({ error: "Failed to send reminder" });
  }
}
