import { describe, it, expect } from "vitest";
import {
  applyBackwardEffect,
  applyDiceMove,
  applyForwardEffect,
  rollDice,
} from "./movement";

describe("logic/movement — applyDiceMove (주사위 이동)", () => {
  it("일반 전진 → 콘텐츠 발동", () => {
    expect(applyDiceMove(5, 3)).toEqual({
      newPos: 8,
      arrived: false,
      bounced: false,
      triggerContent: true,
    });
  });

  it("ARK 정확 도달 → arrived=true, 콘텐츠 미발동", () => {
    expect(applyDiceMove(28, 3)).toEqual({
      newPos: 31,
      arrived: true,
      bounced: false,
      triggerContent: false,
    });
  });

  it("ARK 초과 반사 — PRD 예시: 28에서 5 → 29", () => {
    expect(applyDiceMove(28, 5)).toEqual({
      newPos: 29,
      arrived: false,
      bounced: true,
      triggerContent: false, // 반사칸 콘텐츠 미발동
    });
  });

  it("ARK 초과 반사 — 30에서 6 → 26 (30+6=36, over=5, 31-5=26)", () => {
    expect(applyDiceMove(30, 6)).toEqual({
      newPos: 26,
      arrived: false,
      bounced: true,
      triggerContent: false,
    });
  });

  it("ARK 초과 반사 — 29에서 4 → 29 (29+4=33, over=2, 31-2=29)", () => {
    expect(applyDiceMove(29, 4)).toEqual({
      newPos: 29,
      arrived: false,
      bounced: true,
      triggerContent: false,
    });
  });
});

describe("logic/movement — applyForwardEffect (이벤트 전진, 콘텐츠 미발동)", () => {
  it("일반 전진 — 콘텐츠 미발동 (연쇄 방지, PRD §4.1.6)", () => {
    expect(applyForwardEffect(5, 3)).toEqual({
      newPos: 8,
      arrived: false,
      bounced: false,
      triggerContent: false,
    });
  });

  it("ARK 정확 도달 — arrived=true", () => {
    expect(applyForwardEffect(28, 3)).toEqual({
      newPos: 31,
      arrived: true,
      bounced: false,
      triggerContent: false,
    });
  });

  it("ARK 초과 반사 적용 — 30에서 +3 → 29 (over=2)", () => {
    expect(applyForwardEffect(30, 3)).toEqual({
      newPos: 29,
      arrived: false,
      bounced: true,
      triggerContent: false,
    });
  });
});

describe("logic/movement — applyBackwardEffect", () => {
  it("일반 후진 — 콘텐츠 미발동", () => {
    expect(applyBackwardEffect(10, 2)).toEqual({
      newPos: 8,
      arrived: false,
      bounced: false,
      triggerContent: false,
    });
  });

  it("START(0) 아래로 가지 않음", () => {
    expect(applyBackwardEffect(1, 5).newPos).toBe(0);
  });
});

describe("logic/movement — rollDice", () => {
  it("rng 주입 시 결정적", () => {
    expect(rollDice(() => 0)).toBe(1);
    expect(rollDice(() => 0.5)).toBe(4);
    expect(rollDice(() => 0.999)).toBe(6);
  });

  it("1~6 범위 보장 (100회 sampling)", () => {
    for (let i = 0; i < 100; i++) {
      const d = rollDice();
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });
});
