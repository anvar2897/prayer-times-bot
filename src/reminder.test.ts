import { describe, it, expect } from "vitest";
import { buildReminderMessage } from "./reminder.js";

describe("buildReminderMessage", () => {
  it("returns the Uzbek Friday reminder text", () => {
    expect(buildReminderMessage()).toBe(
      "Жума муборак! Намоз вақтларини юборинг 🕌"
    );
  });
});
