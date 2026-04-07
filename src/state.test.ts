import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { saveChatId, loadChatId } from "./state.js";

const STATE_PATH = "state.json";

beforeEach(() => {
  if (existsSync(STATE_PATH)) unlinkSync(STATE_PATH);
});

afterEach(() => {
  if (existsSync(STATE_PATH)) unlinkSync(STATE_PATH);
});

describe("saveChatId", () => {
  it("writes chatId to state.json", () => {
    saveChatId(123456789);
    const data = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    expect(data.chatId).toBe(123456789);
  });
});

describe("loadChatId", () => {
  it("returns null when state.json does not exist", () => {
    expect(loadChatId()).toBeNull();
  });

  it("returns chatId when state.json exists", () => {
    saveChatId(987654321);
    expect(loadChatId()).toBe(987654321);
  });
});
