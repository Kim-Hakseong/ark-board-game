import { describe, it, expect } from "vitest";
import { addPlayer, initGame, startGame } from "./state";
import { advanceDay, endGame, triggerRain } from "./turn";

function setup() {
  let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
  s = addPlayer(s, { id: "p1", name: "A", animalId: "dove" });
  s = addPlayer(s, { id: "p2", name: "B", animalId: "lion" });
  return startGame(s);
}

describe("triggerRain — 수동 트리거", () => {
  it("countdown 비활성 → 활성화, daysLeft 7, phase=rain", () => {
    const s = triggerRain(setup());
    expect(s.countdown.active).toBe(true);
    expect(s.countdown.daysLeft).toBe(7);
    expect(s.phase).toBe("rain");
  });

  it("이미 활성이면 무동작", () => {
    let s = triggerRain(setup());
    const before = s;
    s = triggerRain(s);
    expect(s).toBe(before);
  });
});

describe("advanceDay — 하루 넘기기", () => {
  it("daysLeft -1", () => {
    let s = triggerRain(setup());
    s = advanceDay(s);
    expect(s.countdown.daysLeft).toBe(6);
  });

  it("D-0 도달 → phase=ended", () => {
    let s = triggerRain(setup());
    s = { ...s, countdown: { ...s.countdown, daysLeft: 1 } };
    s = advanceDay(s);
    expect(s.phase).toBe("ended");
    expect(s.countdown.daysLeft).toBe(0);
  });

  it("countdown 비활성 시 무동작", () => {
    const s = setup();
    const r = advanceDay(s);
    expect(r).toBe(s);
  });
});

describe("endGame — 즉시 종료", () => {
  it("phase → ended", () => {
    const s = endGame(setup());
    expect(s.phase).toBe("ended");
  });

  it("이미 종료 시 무동작", () => {
    let s = endGame(setup());
    const before = s;
    s = endGame(s);
    expect(s).toBe(before);
  });
});
