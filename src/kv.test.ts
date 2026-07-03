import { describe, it, expect, vi, beforeEach } from "vitest";

const { setMock, getMock, RedisMock } = vi.hoisted(() => {
  const setMock = vi.fn();
  const getMock = vi.fn();
  class RedisMock {
    set = setMock;
    get = getMock;
  }
  return { setMock, getMock, RedisMock };
});

vi.mock("@upstash/redis", () => ({ Redis: RedisMock }));

beforeEach(() => {
  setMock.mockReset();
  getMock.mockReset();
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
});

describe("saveChatId", () => {
  it("stores the chat id under the expected key", async () => {
    const { saveChatId } = await import("./kv.js");
    await saveChatId(123456789);
    expect(setMock).toHaveBeenCalledWith("prayer-times-bot:chat-id", 123456789);
  });
});

describe("loadChatId", () => {
  it("returns null when no chat id is stored", async () => {
    getMock.mockResolvedValueOnce(null);
    const { loadChatId } = await import("./kv.js");
    expect(await loadChatId()).toBeNull();
  });

  it("returns the stored chat id", async () => {
    getMock.mockResolvedValueOnce(987654321);
    const { loadChatId } = await import("./kv.js");
    expect(await loadChatId()).toBe(987654321);
  });
});
