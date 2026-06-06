import { describe, it, expect } from "vitest";
import { addPlayer, initGame, startGame } from "./state";
import { computeResults } from "./results";
import type { GameState } from "./types";

function setup(playerCount = 4): GameState {
  let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
  for (let i = 0; i < playerCount; i++) {
    s = addPlayer(s, { id: `p${i}`, name: `P${i}`, animalId: `a${i}` });
  }
  return startGame(s);
}

function setPlayer(s: GameState, id: string, patch: Partial<GameState["players"][number]>): GameState {
  return { ...s, players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

describe("computeResults — PRD §4.5 점수 분해", () => {
  it("도착자 먼저, arrivalRank asc, 미도착자는 total desc", () => {
    let s = setup(4);
    // p0 도착 2등 (tokens 누적 8 = 토큰 5 + 보너스 3)
    s = setPlayer(s, "p0", { arrived: true, arrivalRank: 2, tokens: 8, position: 31 });
    // p1 도착 1등 (tokens 누적 10 = 토큰 5 + 보너스 5)
    s = setPlayer(s, "p1", { arrived: true, arrivalRank: 1, tokens: 10, position: 31 });
    // p2 미도착, tokens 3, position 20
    s = setPlayer(s, "p2", { arrived: false, tokens: 3, position: 20 });
    // p3 미도착, tokens 5, position 10
    s = setPlayer(s, "p3", { arrived: false, tokens: 5, position: 10 });

    const r = computeResults(s);
    expect(r.map((e) => e.playerId)).toEqual(["p1", "p0", "p3", "p2"]);
    expect(r.map((e) => e.finalRank)).toEqual([1, 2, 3, 4]);
  });

  it("점수 분해: total = tokensExcludingBonus + arrivalBonus", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { arrived: true, arrivalRank: 1, tokens: 12, position: 31 });
    s = setPlayer(s, "p1", { arrived: false, tokens: 7, position: 20 });
    const r = computeResults(s);
    const p0 = r.find((e) => e.playerId === "p0")!;
    expect(p0.arrivalBonus).toBe(5);
    expect(p0.tokensExcludingBonus).toBe(7);
    expect(p0.total).toBe(12);
    const p1 = r.find((e) => e.playerId === "p1")!;
    expect(p1.arrivalBonus).toBe(0);
    expect(p1.tokensExcludingBonus).toBe(7);
    expect(p1.total).toBe(7);
  });

  it("미도착자 동점 시 position desc tiebreak", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { tokens: 3, position: 10 });
    s = setPlayer(s, "p1", { tokens: 3, position: 20 });
    const r = computeResults(s);
    expect(r[0].playerId).toBe("p1");
    expect(r[1].playerId).toBe("p0");
  });
});
