import { describe, it, expect } from "vitest";
import { addPlayer, advanceTurn, initGame, removePlayer, startGame } from "./state";

function setupGame(playerCount: number) {
  let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
  for (let i = 0; i < playerCount; i++) {
    s = addPlayer(s, { id: `p${i}`, name: `P${i}`, animalId: `a${i}` });
  }
  s = startGame(s);
  return s;
}

describe("logic/state — initGame", () => {
  it("로비 phase, players 0명, seq 0", () => {
    const s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    expect(s.phase).toBe("lobby");
    expect(s.players).toEqual([]);
    expect(s.seq).toBe(0);
    expect(s.countdown).toEqual({ active: false, daysLeft: 7 });
  });
});

describe("logic/state — addPlayer / removePlayer", () => {
  it("플레이어 추가", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "철수", animalId: "dove" });
    expect(s.players.length).toBe(1);
    expect(s.players[0].name).toBe("철수");
    expect(s.players[0].position).toBe(0);
    expect(s.players[0].tokens).toBe(0);
    expect(s.seq).toBe(1);
  });

  it("같은 id 중복 거부", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "철수", animalId: "dove" });
    const seq = s.seq;
    s = addPlayer(s, { id: "p1", name: "다른이름", animalId: "lion" });
    expect(s.players.length).toBe(1);
    expect(s.seq).toBe(seq);
  });

  it("같은 동물 선점 거부", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "A", animalId: "dove" });
    const seq = s.seq;
    s = addPlayer(s, { id: "p2", name: "B", animalId: "dove" });
    expect(s.players.length).toBe(1);
    expect(s.seq).toBe(seq);
  });

  it("최대 8명", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    for (let i = 0; i < 9; i++) {
      s = addPlayer(s, { id: `p${i}`, name: `P${i}`, animalId: `a${i}` });
    }
    expect(s.players.length).toBe(8);
  });

  it("로비 외에는 추가/제거 거부", () => {
    const s = setupGame(2);
    const s2 = addPlayer(s, { id: "p9", name: "Late", animalId: "z" });
    expect(s2.players.length).toBe(2);
    const s3 = removePlayer(s, "p0");
    expect(s3.players.length).toBe(2);
  });

  it("removePlayer 로비에서 동작", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "A", animalId: "dove" });
    s = addPlayer(s, { id: "p2", name: "B", animalId: "lion" });
    s = removePlayer(s, "p1");
    expect(s.players.map((p) => p.id)).toEqual(["p2"]);
  });
});

describe("logic/state — startGame", () => {
  it("2명 이상 시 playing 전환", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "A", animalId: "dove" });
    s = addPlayer(s, { id: "p2", name: "B", animalId: "lion" });
    s = startGame(s);
    expect(s.phase).toBe("playing");
    expect(s.currentTurnIdx).toBe(0);
  });

  it("1명 이하 시 거부", () => {
    let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    s = addPlayer(s, { id: "p1", name: "A", animalId: "dove" });
    s = startGame(s);
    expect(s.phase).toBe("lobby");
  });
});

describe("logic/state — advanceTurn", () => {
  it("다음 인덱스로 진행", () => {
    let s = setupGame(3);
    const seq0 = s.seq;
    s = advanceTurn(s);
    expect(s.currentTurnIdx).toBe(1);
    expect(s.seq).toBe(seq0 + 1);
  });

  it("마지막 → 0으로 랩, roundsCompleted +1", () => {
    let s = setupGame(3);
    expect(s.roundsCompleted).toBe(0);
    s = advanceTurn(s); // 1
    s = advanceTurn(s); // 2
    s = advanceTurn(s); // lap → 0
    expect(s.currentTurnIdx).toBe(0);
    expect(s.roundsCompleted).toBe(1);
  });

  it("비 카운트다운 활성 시 한 바퀴마다 daysLeft -1 (PRD §4.4: 1일=1바퀴)", () => {
    let s = setupGame(3);
    s = { ...s, countdown: { active: true, daysLeft: 7 } };
    s = advanceTurn(s); // 1
    s = advanceTurn(s); // 2
    s = advanceTurn(s); // lap
    expect(s.countdown.daysLeft).toBe(6);
  });

  it("D-0 도달 시 phase=ended (PRD §4.4)", () => {
    let s = setupGame(2);
    s = { ...s, countdown: { active: true, daysLeft: 1 } };
    s = advanceTurn(s); // 1
    s = advanceTurn(s); // lap → 0, daysLeft 0
    expect(s.countdown.daysLeft).toBe(0);
    expect(s.phase).toBe("ended");
  });

  it("pendingSkip 플레이어는 자동 스킵 + 플래그 클리어", () => {
    let s = setupGame(3);
    s = {
      ...s,
      players: s.players.map((p, i) => (i === 1 ? { ...p, pendingSkip: true } : p)),
    };
    s = advanceTurn(s); // p1 차례인데 skip → p2로 자동 진행
    expect(s.currentTurnIdx).toBe(2);
    expect(s.players[1].pendingSkip).toBe(false);
  });

  it("playing이 아니면 무동작", () => {
    const s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
    const s2 = advanceTurn(s);
    expect(s2).toBe(s);
  });
});
