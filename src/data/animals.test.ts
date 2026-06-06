import { describe, it, expect } from "vitest";
import { ANIMALS, getAnimal } from "./animals";

describe("data/animals — 무결성", () => {
  it("정확히 8종 (PRD §3)", () => {
    expect(ANIMALS.length).toBe(8);
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

  it("PRD 명시 8종 모두 포함 — 비둘기/사자/코끼리/기린/거북이/토끼/여우/양", () => {
    const names = ANIMALS.map((a) => a.name).sort();
    expect(names).toEqual(
      ["기린", "거북이", "비둘기", "사자", "양", "여우", "코끼리", "토끼"].sort(),
    );
  });

  it("getAnimal — id 조회 정상", () => {
    expect(getAnimal("dove")?.name).toBe("비둘기");
    expect(getAnimal("nope")).toBeUndefined();
  });
});
