import { describe, it, expect } from "vitest";
import { ANIMALS, getAnimal } from "./animals";

describe("data/animals — 무결성", () => {
  it("정확히 16종 (PRD §3 8종 + 확장 8종)", () => {
    expect(ANIMALS.length).toBe(16);
  });

  it("id 중복 없음", () => {
    const ids = ANIMALS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("이름 중복 없음", () => {
    const names = ANIMALS.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("이모지 중복 없음", () => {
    const emojis = ANIMALS.map((a) => a.emoji);
    expect(new Set(emojis).size).toBe(emojis.length);
  });

  it("PRD §3 원본 8종 모두 포함", () => {
    const names = new Set(ANIMALS.map((a) => a.name));
    for (const expected of [
      "비둘기", "사자", "코끼리", "기린", "거북이", "토끼", "여우", "양",
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });

  it("확장 8종 포함", () => {
    const names = new Set(ANIMALS.map((a) => a.name));
    for (const expected of [
      "곰", "호랑이", "사슴", "고슴도치", "소", "돼지", "닭", "말",
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });

  it("getAnimal — id 조회 정상", () => {
    expect(getAnimal("dove")?.name).toBe("비둘기");
    expect(getAnimal("nope")).toBeUndefined();
  });
});
