import cron from "node-cron";
import { loadChatId } from "./state.js";
import type { Bot } from "grammy";

export function buildReminderMessage(): string {
  return "Жума муборак! Намоз вақтларини юборинг 🕌";
}

export function scheduleWeeklyReminder(bot: Bot): void {
  // Fires every Friday at 09:00 (server local time)
  cron.schedule("0 9 * * 5", async () => {
    const chatId = loadChatId();
    if (!chatId) return;
    try {
      await bot.api.sendMessage(chatId, buildReminderMessage());
    } catch (err) {
      console.error("Failed to send weekly reminder:", err);
    }
  });
}
