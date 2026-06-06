import { describe, it, expect } from "vitest";
import { addPlayer, initGame, startGame } from "./state";
import {
  closeQuiz,
  finalizeQuiz,
  handleDiceRoll,
  handleEventConfirm,
  handleGraceSelect,
  handleInvite,
  handleJudge,
  handleQuizAnswer,
  skipInvite,
} from "./turn";
import type { GameState } from "./types";

function setup(playerCount = 3): GameState {
  let s = initGame({ roomCode: "ABCD", teacherPin: "1234" });
  for (let i = 0; i < playerCount; i++) {
    s = addPlayer(s, { id: `p${i}`, name: `P${i}`, animalId: `a${i}` });
  }
  return startGame(s);
}

function setPlayer(s: GameState, id: string, patch: Partial<GameState["players"][number]>): GameState {
  return { ...s, players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

describe("handleDiceRoll — 기본/반사/도착", () => {
  it("일반 이동 + 콘텐츠 발동(WORD: 1번칸)", () => {
    let s = setup(2);
    // p0이 0에서 1 굴림 → 1번칸(WORD)
    s = handleDiceRoll(s, "p0", 1);
    expect(s.players[0].position).toBe(1);
    expect(s.quiz?.cellIndex).toBe(1);
    expect(s.quiz?.stoppedPlayerId).toBe("p0");
    expect(s.currentTurnIdx).toBe(0); // 퀴즈 진행 중이라 턴 미진행
  });

  it("ARK 정확 도달 — 1등 보너스+5, 비 카운트다운 자동 트리거, 턴 진행", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 28 });
    s = handleDiceRoll(s, "p0", 3);
    expect(s.players[0].arrived).toBe(true);
    expect(s.players[0].arrivalRank).toBe(1);
    expect(s.players[0].tokens).toBe(5); // 1등 +5
    expect(s.players[0].position).toBe(31);
    expect(s.countdown.active).toBe(true);
    expect(s.countdown.daysLeft).toBe(7);
    expect(s.phase).toBe("rain");
    expect(s.currentTurnIdx).toBe(1);
  });

  it("ARK 반사 — PRD 예시 28에서 5 → 29, 반사칸 미발동, 턴 진행", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 28 });
    s = handleDiceRoll(s, "p0", 5);
    expect(s.players[0].position).toBe(29);
    expect(s.activeCell).toBeNull();
    expect(s.quiz).toBeNull();
    expect(s.currentTurnIdx).toBe(1);
  });

  it("다른 플레이어 턴에 굴리려 하면 무시", () => {
    let s = setup(2);
    const before = s;
    s = handleDiceRoll(s, "p1", 3);
    expect(s).toBe(before);
  });

  it("도착자가 굴리려 하면 무시", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { arrived: true, position: 31 });
    const before = s;
    s = handleDiceRoll(s, "p0", 3);
    expect(s).toBe(before);
  });

  it("진행 중 퀴즈가 있으면 무시", () => {
    let s = setup(2);
    s = handleDiceRoll(s, "p0", 1); // 1번 WORD 칸 → 퀴즈 열림
    const before = s;
    s = handleDiceRoll(s, "p0", 1);
    expect(s).toBe(before);
  });
});

describe("handleDiceRoll — EVENT 처리", () => {
  it("EVENT 5(비웃음) → 2칸 뒤로 + 확인 대기", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 4 });
    s = handleDiceRoll(s, "p0", 1); // 5번 EVENT
    expect(s.players[0].position).toBe(3);
    expect(s.activeCell?.awaitingConfirm).toBe(true);
    s = handleEventConfirm(s);
    expect(s.currentTurnIdx).toBe(1);
    expect(s.activeCell).toBeNull();
  });

  it("EVENT 10(에녹의 경고) → 토큰 +1", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 9 });
    s = handleDiceRoll(s, "p0", 1); // 10번
    expect(s.players[0].tokens).toBe(1);
    s = handleEventConfirm(s);
    expect(s.currentTurnIdx).toBe(1);
  });

  it("EVENT 14(먹고 마시고) → pendingSkip 설정", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 13 });
    s = handleDiceRoll(s, "p0", 1); // 14번
    expect(s.players[0].pendingSkip).toBe(true);
    s = handleEventConfirm(s);
    // 다음 turn은 p1
    expect(s.currentTurnIdx).toBe(1);
  });

  it("EVENT 20(동물들이 들어간다) → 3칸 전진(콘텐츠 미발동)", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 19 });
    s = handleDiceRoll(s, "p0", 1); // 20번 EVENT
    expect(s.players[0].position).toBe(23); // 20 + 3 = 23
    expect(s.activeCell?.awaitingConfirm).toBe(true);
    expect(s.quiz).toBeNull(); // 23번이 SHARE지만 연쇄 발동 없음
  });

  it("EVENT 25(은혜) → grace 대상 선택 대기", () => {
    let s = setup(3);
    s = setPlayer(s, "p0", { position: 24 });
    s = setPlayer(s, "p1", { position: 5 });
    s = handleDiceRoll(s, "p0", 1); // 25번
    expect(s.activeCell?.awaitingGraceTarget).toBe(true);
    s = handleGraceSelect(s, "p1");
    expect(s.players[1].position).toBe(6);
    expect(s.activeCell).toBeNull();
    expect(s.currentTurnIdx).toBe(1);
  });

  it("EVENT 25(은혜) — 도착자 선택 불가", () => {
    let s = setup(3);
    s = setPlayer(s, "p0", { position: 24 });
    s = setPlayer(s, "p2", { arrived: true, position: 31, arrivalRank: 1 });
    s = handleDiceRoll(s, "p0", 1); // 25번
    const before = s;
    s = handleGraceSelect(s, "p2");
    expect(s).toBe(before);
  });
});

describe("handleJudge — SHARE/MISSION 판정", () => {
  it("MISSION 성공 → 토큰+1, 자리유지, 턴 진행", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 6 });
    s = handleDiceRoll(s, "p0", 1); // 7번 MISSION
    expect(s.activeCell?.awaitingJudge).toBe(true);
    s = handleJudge(s, "success");
    expect(s.players[0].tokens).toBe(1);
    expect(s.players[0].position).toBe(7);
    expect(s.currentTurnIdx).toBe(1);
  });

  it("SHARE 패스 → 1칸 뒤로, 턴 진행", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 2 });
    s = handleDiceRoll(s, "p0", 1); // 3번 SHARE
    s = handleJudge(s, "pass");
    expect(s.players[0].position).toBe(2);
    expect(s.players[0].tokens).toBe(0);
    expect(s.currentTurnIdx).toBe(1);
  });
});

describe("WORD 퀴즈 — 응답/마감/채점", () => {
  it("멈춘 자 정답 → 토큰+1, 자리유지; 다른 정답자 → 각자 토큰+1, 이동 없음 (PRD §4.2)", () => {
    let s = setup(3);
    s = setPlayer(s, "p0", { position: 0 });
    s = handleDiceRoll(s, "p0", 1); // 1번 WORD (정답 idx 2)
    expect(s.quiz?.cellIndex).toBe(1);
    s = handleQuizAnswer(s, "p0", 2); // 정답
    s = handleQuizAnswer(s, "p1", 2); // 정답
    s = handleQuizAnswer(s, "p2", 0); // 오답 (다른 사람이라 토큰 변동 없음, 이동 없음)
    expect(s.quiz?.closed).toBe(true); // 전원 응답으로 자동 마감
    expect(s.players[0].tokens).toBe(1);
    expect(s.players[0].position).toBe(1);
    expect(s.players[1].tokens).toBe(1);
    expect(s.players[1].position).toBe(0);
    expect(s.players[2].tokens).toBe(0);
    s = finalizeQuiz(s);
    expect(s.quiz).toBeNull();
    expect(s.currentTurnIdx).toBe(1);
  });

  it("멈춘 자 오답 → 1칸 뒤로", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 0 });
    s = handleDiceRoll(s, "p0", 1); // 1번 WORD
    s = handleQuizAnswer(s, "p0", 0); // 오답
    s = handleQuizAnswer(s, "p1", 0); // 오답
    expect(s.quiz?.closed).toBe(true);
    expect(s.players[0].position).toBe(0); // max(0, 1-1) = 0
    expect(s.players[0].tokens).toBe(0);
  });

  it("타이머 만료 시 closeQuiz로 채점 (무응답 = 오답)", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 0 });
    s = handleDiceRoll(s, "p0", 1); // 1번 WORD
    s = handleQuizAnswer(s, "p1", 2); // p1 정답
    s = closeQuiz(s);
    expect(s.quiz?.closed).toBe(true);
    expect(s.players[1].tokens).toBe(1);
    expect(s.players[0].position).toBe(0); // 무응답 → 1칸 뒤로 (clamp)
  });

  it("중복 응답 거부(첫 답만 인정)", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { position: 0 });
    s = handleDiceRoll(s, "p0", 1);
    s = handleQuizAnswer(s, "p0", 0);
    s = handleQuizAnswer(s, "p0", 2); // 무시
    expect(s.quiz?.answers["p0"]).toBe(0);
  });
});

describe("초청자 턴 — handleInvite / skipInvite", () => {
  it("도착자 inviterId가 미도착 target에 +1칸", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { arrived: true, position: 31, arrivalRank: 1 });
    s = setPlayer(s, "p1", { position: 5 });
    // currentTurnIdx=0이 도착자
    s = handleInvite(s, "p0", "p1");
    expect(s.players[1].position).toBe(6);
    expect(s.currentTurnIdx).toBe(1);
  });

  it("미도착자가 invite 시도하면 무시", () => {
    let s = setup(2);
    const before = s;
    s = handleInvite(s, "p0", "p1");
    expect(s).toBe(before);
  });

  it("skipInvite — 15초 무선택 시 자동 스킵", () => {
    let s = setup(2);
    s = setPlayer(s, "p0", { arrived: true, position: 31, arrivalRank: 1 });
    s = skipInvite(s, "p0");
    expect(s.currentTurnIdx).toBe(1);
  });
});

describe("도착 순위/보너스 — PRD §4.5", () => {
  it("1등 +5, 2등 +3, 3등 +2, 4등 +1", () => {
    let s = setup(4);
    s = setPlayer(s, "p0", { position: 28 });
    s = handleDiceRoll(s, "p0", 3); // 도착 1등
    expect(s.players[0].arrivalRank).toBe(1);
    expect(s.players[0].tokens).toBe(5);

    s = setPlayer(s, "p1", { position: 28 });
    // currentTurnIdx는 이미 1이 되어있음
    s = handleDiceRoll(s, "p1", 3);
    expect(s.players[1].arrivalRank).toBe(2);
    expect(s.players[1].tokens).toBe(3);

    s = setPlayer(s, "p2", { position: 28 });
    s = handleDiceRoll(s, "p2", 3);
    expect(s.players[2].arrivalRank).toBe(3);
    expect(s.players[2].tokens).toBe(2);

    s = setPlayer(s, "p3", { position: 28 });
    s = handleDiceRoll(s, "p3", 3);
    expect(s.players[3].arrivalRank).toBe(4);
    expect(s.players[3].tokens).toBe(1);
    expect(s.phase).toBe("ended"); // 전원 도착
  });
});
