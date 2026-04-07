import { readFileSync, writeFileSync, existsSync } from "fs";

const STATE_PATH = "state.json";

interface State {
  chatId: number;
}

export function saveChatId(chatId: number): void {
  writeFileSync(STATE_PATH, JSON.stringify({ chatId }), "utf-8");
}

export function loadChatId(): number | null {
  if (!existsSync(STATE_PATH)) return null;
  try {
    const data = JSON.parse(readFileSync(STATE_PATH, "utf-8")) as State;
    return data.chatId ?? null;
  } catch {
    return null;
  }
}
