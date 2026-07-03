import { Redis } from "@upstash/redis";

const CHAT_ID_KEY = "prayer-times-bot:chat-id";

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Redis env vars not set (expected UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN)"
    );
  }

  return new Redis({ url, token });
}

export async function saveChatId(chatId: number): Promise<void> {
  await getRedis().set(CHAT_ID_KEY, chatId);
}

export async function loadChatId(): Promise<number | null> {
  const value = await getRedis().get<number>(CHAT_ID_KEY);
  return value ?? null;
}
