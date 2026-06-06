import { describe, expect, it } from "vitest";
import { generatePin, generatePlayerId, generateRoomCode } from "./codes";

describe("codes — 룸 코드/PIN 생성", () => {
  it("룸 코드 — 길이 4, 혼동 글자 제외", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode();
      expect(code).toHaveLength(4);
      expect(/^[A-HJ-NP-Z]{4}$/.test(code)).toBe(true);
    }
  });

  it("PIN — 4자리 숫자, 1000~9999", () => {
    for (let i = 0; i < 50; i++) {
      const pin = generatePin();
      expect(pin).toMatch(/^\d{4}$/);
      const n = Number(pin);
      expect(n).toBeGreaterThanOrEqual(1000);
      expect(n).toBeLessThanOrEqual(9999);
    }
  });

  it("playerId — 16진수 8자리", () => {
    for (let i = 0; i < 20; i++) {
      const id = generatePlayerId();
      expect(id).toMatch(/^[0-9a-f]{8}$/);
    }
  });
});
