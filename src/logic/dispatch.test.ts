import { describe, it, expect } from "vitest";
import { dispatch } from "./dispatch";
import { initGame } from "./state";
import { QUIZ_TIME_MS } from "./turn";
import type { GameState } from "./types";

function setPlayer(s: GameState, id: string, patch: Partial<GameState["players"][number]>): GameState {
  return { ...s, players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

describe("dispatch — Action 라우팅", () => {
  it("join → 플레이어 추가", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "철수", animalId: "dove" });
    expect(s.players.length).toBe(1);
  });

  it("phase=start → playing 전환", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    expect(s.phase).toBe("playing");
  });

  it("roll → 퀴즈 열릴 때 deadlineMs = now + QUIZ_TIME_MS", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    const fixedNow = 1_000_000;
    s = dispatch(s, { type: "roll", playerId: "p1", dice: 1 }, { now: () => fixedNow });
    expect(s.quiz?.cellIndex).toBe(1);
    expect(s.quiz?.deadlineMs).toBe(fixedNow + QUIZ_TIME_MS);
  });

  it("answer → 퀴즈에 응답 누적", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    s = dispatch(s, { type: "roll", playerId: "p1", dice: 1 });
    s = dispatch(s, { type: "answer", playerId: "p1", choice: 2 });
    expect(s.quiz?.answers["p1"]).toBe(2);
  });

  it("phase=rain → countdown 활성, phase=nextDay → D-1", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    s = dispatch(s, { type: "phase", cmd: "rain" });
    expect(s.countdown.active).toBe(true);
    expect(s.countdown.daysLeft).toBe(7);
    s = dispatch(s, { type: "phase", cmd: "nextDay" });
    expect(s.countdown.daysLeft).toBe(6);
  });

  it("phase=end → 즉시 ended", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    s = dispatch(s, { type: "phase", cmd: "end" });
    expect(s.phase).toBe("ended");
  });

  it("resync → state 변경 없음", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    const before = s;
    s = dispatch(s, { type: "resync", playerId: "p1" });
    expect(s).toBe(before);
  });

  it("invite — 도착자가 미도착 대상에게 +1", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = dispatch(s, { type: "join", playerId: "p1", name: "A", animalId: "dove" });
    s = dispatch(s, { type: "join", playerId: "p2", name: "B", animalId: "lion" });
    s = dispatch(s, { type: "phase", cmd: "start" });
    s = setPlayer(s, "p1", { arrived: true, position: 31, arrivalRank: 1 });
    s = setPlayer(s, "p2", { position: 5 });
    s = dispatch(s, { type: "invite", playerId: "p1", targetId: "p2" });
    expect(s.players[1].position).toBe(6);
    expect(s.currentTurnIdx).toBe(1);
  });
});
